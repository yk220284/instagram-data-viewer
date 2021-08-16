import { Component, Input, OnChanges } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, take, tap } from 'rxjs/operators';
import { PresistDataService } from '../../../services/presist-data.service';
import { Profile } from '../../../../profile';
import { Post, PostState } from 'src/post';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}

const PLATFORMS = [
  { value: 'instagram', viewValue: 'Instagram' },
  { value: 'facebook', viewValue: 'Facebook' },
  { value: 'tiktok', viewValue: 'TikTok' },
  { value: 'twitter', viewValue: 'Twitter' },
  { value: 'other', viewValue: 'Other' },
] as const;

const SCAM_TYPES = [
  { value: 'imperonator', viewValue: 'Impersonator (default)' },
  { value: 'catfish', viewValue: 'romance scam, 漂亮女优' },
  { value: 'lotteryMoney', viewValue: 'lottery/money scam, 骗钱的，赢彩票' },
  { value: 'fakeOrder', viewValue: 'fake order scam, 买东西，交钱不给货' },
  { value: 'reportforother', viewValue: 'Report for others, 帮别人举报,分不出来' },
] as const;

// Fields in the form
const profileField = [
  'username',
  'full_name',
  'isIrrelevant',
  'postsCnt',
  'followerCnt',
  'followingCnt',
  'platform',
  'scamType',
] as const;
type ProfileField = typeof profileField[number];

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnChanges {
  profileForm = new FormGroup({
    username: new FormControl('', [Validators.required, forbiddenNameValidator(/ /i)]),
    full_name: new FormControl(''),
    postsCnt: new FormControl(0),
    followerCnt: new FormControl(0),
    followingCnt: new FormControl(0),
    platform: new FormControl(PLATFORMS[0].value, [Validators.required]),
    scamType: new FormControl(SCAM_TYPES[0].value, [Validators.required]),
    isIrrelevant: new FormControl(false, [Validators.required]),
  });
  @Input() post!: Post;
  @Input() url!: string;
  @Input() postState!: PostState;
  profile: Profile | undefined;
  nextRoute: string | undefined;
  previousRoute: string | undefined;
  PLATFORMS = PLATFORMS;
  SCAM_TYPES = SCAM_TYPES;

  // Autocomplet Form
  userNameFilteredOptions: Observable<string[]> = of([]);
  fullNameFilteredOptions: Observable<string[]> = of([]);

  private _filter(value: string, options: string[]): string[] {
    if (!!value) {
      const filterValue = value.toLowerCase();
      return options.filter((option) => option.toLowerCase().includes(filterValue));
    }
    return options;
  }

  // Next Post
  getNextRoute() {
    this.presistDataService
      .getNextPost(this.post.shortcode, this.postState, 1)
      .subscribe(
        (p) => (this.nextRoute = p === null ? '/processed-posts' : `/detail/${this.postState}/${p.shortcode}`)
      );
    this.presistDataService
      .getNextPost(this.post.shortcode, this.postState, -1)
      .subscribe(
        (p) => (this.previousRoute = p === null ? '/processed-posts' : `/detail/${this.postState}/${p.shortcode}`)
      );
  }

  hasNextRoute() {
    return this.nextRoute !== undefined && this.nextRoute.includes('detail');
  }

  ngOnChanges() {
    if (this.postState === 'processed') {
      this.presistDataService
        .getProfile(this.post.shortcode)
        .pipe(
          take(1),
          tap((profile: Profile) => {
            this.profile = profile;
            this.profileForm
              .get('isIrrelevant')
              ?.setValue(profile.isIrrelevant === null ? false : profile.isIrrelevant);
            this.toggleIrrelevance();
            this.profileForm.get('username')?.setValue(profile.username);
            this.profileForm.get('full_name')?.setValue(profile.full_name);
            this.profileForm.get('postsCnt')?.setValue(profile.postsCnt);
            this.profileForm.get('followerCnt')?.setValue(profile.followerCnt);
            this.profileForm.get('followingCnt')?.setValue(profile.followingCnt);
            this.profileForm.get('platform')?.setValue(profile.platform);
            this.profileForm.get('scamType')?.setValue(profile.scamType || SCAM_TYPES[0].value);
          })
        )
        .subscribe();
    } else {
      // Reset field enablity when a post is unprocessed
      this.profileForm.get('platform')?.setValue(PLATFORMS[0].value);
      this.profileForm.get('scamType')?.setValue(SCAM_TYPES[0].value);
      this.profileForm.get('isIrrelevant')?.setValue(false);
      this.toggleIrrelevance();
    }

    this.getNextRoute();
    // Autocomplete form
    this.userNameFilteredOptions = this.profileForm.get('username')!.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filter(value, this.post.fake_names))
    );
    this.fullNameFilteredOptions = this.profileForm.get('full_name')!.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filter(value, [this.post.postProfile.full_name]))
    );
  }

  constructor(private presistDataService: PresistDataService, private router: Router, private _snackBar: MatSnackBar) {}

  fieldUnchanged(controlName: ProfileField) {
    if (this.postState === 'processed' && this.profile)
      return this.profileForm.get(controlName)?.value === this.profile[controlName];
    return false;
  }

  formUnchanged() {
    return profileField.every((controlName) => this.fieldUnchanged(controlName));
  }

  validateFormControl(formControlName: string) {
    let control = this.profileForm.get(formControlName);
    return control!.invalid && (control!.dirty || control!.touched);
  }

  handleProfile(profile: Profile) {
    if (this.formUnchanged()) {
      return Promise.resolve();
    }
    if (this.postState === 'unprocessed') {
      return this.presistDataService.addProfile(profile).then(() => {
        this.presistDataService.deleteUnprocessedPost(profile.shortcode);
      });
    }
    // _updateProfile
    return this.presistDataService.addProfile(profile);
  }

  private openSnackBar() {
    const info = `username ${this.profileForm.get('username')?.value}`;
    const msg =
      this.postState === 'unprocessed'
        ? `submit ${info}`
        : this.formUnchanged()
        ? 'Fields Unchanged'
        : `updated ${info}`;
    this._snackBar.open(msg, 'close', { duration: 3000 });
  }

  toggleIrrelevance() {
    profileField
      .filter((field) => field !== 'isIrrelevant')
      .forEach((field) =>
        this.profileForm.get('isIrrelevant')?.value
          ? this.profileForm.get(field)?.disable()
          : this.profileForm.get(field)?.enable()
      );
  }

  onSubmit(formData: any, formDir: FormGroupDirective) {
    this.openSnackBar();
    const submitTime = this.profile?.submitTime || Date.now();
    const profile: Profile = {
      username: this.profileForm.get('username')!.value,
      full_name: this.profileForm.get('full_name')!.value,
      isIrrelevant: this.profileForm.get('isIrrelevant')!.value,
      postsCnt: this.profileForm.get('postsCnt')!.value,
      followerCnt: this.profileForm.get('followerCnt')!.value,
      followingCnt: this.profileForm.get('followingCnt')!.value,
      platform: this.profileForm.get('platform')!.value,
      scamType: this.profileForm.get('scamType')!.value,
      url: this.url,
      submitTime: submitTime,
      shortcode: this.post.shortcode,
      post: this.post,
      postState: this.postState,
    };
    const nextRoute = this.postState === 'unprocessed' || !this.formUnchanged() ? this.nextRoute : this.previousRoute;
    this.handleProfile(profile)
      .then(() => {
        formDir.resetForm();
        this.profileForm.reset();
        this.router.navigate([nextRoute]);
      })
      .catch((e) => {
        console.log('err: ', e);
      });
  }
}
