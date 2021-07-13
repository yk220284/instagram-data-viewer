import { Component, Input, OnChanges, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { from, Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PresistDataService } from '../../../services/presist-data.service';
import { Profile } from '../../../../profile';
import { Post } from 'src/post';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnChanges {
  profileForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      forbiddenNameValidator(/ /i),
    ]),
    full_name: new FormControl(''),
  });
  @Input() post!: Post;
  @Input() url!: string;
  @Input() isProcessed!: boolean;
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
  getNextRoute() {
    this.presistDataService
      .getNextPost(this.post.shortcode)
      .subscribe(
        (p) =>
          (this.nextRoute =
            p === null ? '/processed-posts' : `/detail/${p.shortcode}`)
      );
  }
  ngOnInit(): void {
    // Fill in form if processed
    if (this.isProcessed) {
      this.presistDataService
        .getProfile(this.post.shortcode)
        .subscribe((profile) => {
          this.profile = profile;
          this.profileForm.get('username')?.setValue(profile.username);
          this.profileForm.get('full_name')?.setValue(profile.full_name);
        });
    }
    this.getNextRoute();
    // Autocomplete form
    this.filteredOptions = this.profileForm.get('username')!.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filter(value))
    );
    console.log(`is Processed: ${this.isProcessed}`);
  }

  ngOnChanges() {
    this.getNextRoute();
  }

  constructor(private presistDataService: PresistDataService) {}

  fieldChanged(controlName: 'username' | 'full_name') {
    if (this.isProcessed && this.profile)
      return (
        this.profileForm.get(controlName)?.value === this.profile[controlName]
      );
    return false;
  }

  fullNameChanged() {
    if (this.isProcessed)
      return (
        this.profileForm.get('full_name')?.value === this.profile?.full_name
      );
    return false;
  }

  validateFormControl(formControlName: string) {
    let control = this.profileForm.get(formControlName);
    return control!.invalid && (control!.dirty || control!.touched);
  }

  handleProfile(profile: Profile) {
    if (!this.isProcessed) {
      console.log('adding new profile');

      return this.presistDataService.addProfile(profile).then(() => {
        this.presistDataService.movePostJson(profile.shortcode).subscribe();
      });
    }
    // _updateProfile
    return this.presistDataService.updateProfile(profile);
  }

  onSubmit(formData: any, formDir: FormGroupDirective) {
    const profile: Profile = {
      username: this.profileForm.get('username')!.value,
      full_name: this.profileForm.get('full_name')!.value,
      url: this.url,
      shortcode: this.post.shortcode,
    };
    this.handleProfile(profile)
      .then(() => {
        formDir.resetForm();
        this.profileForm.reset();
      })
      .catch((e) => {
        console.log('err: ', e);
      });
  }
}
