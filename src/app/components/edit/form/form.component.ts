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

// Fields in the form
const profileField = ['username', 'full_name', 'isIrrelevant'] as const;
type ProfileField = typeof profileField[number];

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnChanges {
  profileForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      forbiddenNameValidator(/ /i),
    ]),
    full_name: new FormControl(''),
    isIrrelevant: new FormControl(false),
  });
  @Input() post!: Post;
  @Input() url!: string;
  @Input() postState!: PostState;
  profile: Profile | undefined;
  nextRoute: string | undefined;

  // Autocomplet Form
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]> = of([]);

  private _filter(value: string): string[] {
    if (!!value) {
      const filterValue = value.toLowerCase();
      return this.options.filter((option) =>
        option.toLowerCase().includes(filterValue)
      );
    }
    return this.options;
  }

  // Next Post
  getNextRoute() {
    this.presistDataService
      .getNextPost(this.post.shortcode, this.postState)
      .subscribe(
        (p) =>
          (this.nextRoute =
            p === null
              ? '/processed-posts'
              : `/detail/${this.postState}/${p.shortcode}`)
      );
  }

  hasNextRoute() {
    return this.nextRoute !== undefined && this.nextRoute.includes('detail');
  }

  ngOnChanges() {
    if (this.postState === 'processed') {
      console.log('triggered on change', this.post.postProfile.username);
      this.presistDataService
        .getProfile(this.post.shortcode)
        .pipe(
          take(1),
          tap((profile: Profile) => {
            console.log('getting profile', profile.username);
            this.profile = profile;
            this.profileForm
              .get('isIrrelevant')
              ?.setValue(profile.isIrrelevant);
            this.toggleIrrelevance();
            this.profileForm.get('username')?.setValue(profile.username);
            this.profileForm.get('full_name')?.setValue(profile.full_name);
          })
        )
        .subscribe();
    } else {
      // Reset field enablity when a post is unprocessed
      this.toggleIrrelevance();
    }

    this.getNextRoute();
    // Autocomplete form
    this.filteredOptions = this.profileForm.get('username')!.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filter(value))
    );
  }

  constructor(
    private presistDataService: PresistDataService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  fieldUnchanged(controlName: ProfileField) {
    if (this.postState === 'processed' && this.profile)
      return (
        this.profileForm.get(controlName)?.value === this.profile[controlName]
      );
    return false;
  }

  formUnchanged() {
    return profileField.every((controlName) =>
      this.fieldUnchanged(controlName)
    );
  }

  validateFormControl(formControlName: string) {
    let control = this.profileForm.get(formControlName);
    return control!.invalid && (control!.dirty || control!.touched);
  }

  handleProfile(profile: Profile) {
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
    const profile: Profile = {
      username: this.profileForm.get('username')!.value,
      full_name: this.profileForm.get('full_name')!.value,
      isIrrelevant: this.profileForm.get('isIrrelevant')!.value,
      url: this.url,
      shortcode: this.post.shortcode,
      post: this.post,
      postState: this.postState,
    };
    this.handleProfile(profile)
      .then(() => {
        formDir.resetForm();
        this.profileForm.reset();
        this.router.navigate([this.nextRoute]);
      })
      .catch((e) => {
        console.log('err: ', e);
      });
  }
}
