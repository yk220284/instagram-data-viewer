import { Component, Input, OnInit } from '@angular/core';
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
export class FormComponent implements OnInit {
  profileForm = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      forbiddenNameValidator(/ /i),
    ]),
    fullName: new FormControl(''),
  });
  @Input() post!: Post;
  @Input() url!: string;
  @Input() isProcessed!: boolean;

  // Autocomplet Form
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]> = of([]);
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }
  ngOnInit(): void {
    // Autocomplete form
    this.filteredOptions = this.profileForm.get('userName')!.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filter(value))
    );
    console.log(`is Processed: ${this.isProcessed}`);
  }
  // items: Observable<any>;

  constructor(private presistDataService: PresistDataService) {
    // this.items = presistDataService.getItems();
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
      username: this.profileForm.get('userName')!.value,
      full_name: this.profileForm.get('fullName')!.value,
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

  // this.name = this.name.trim();
  // if (!this.name) {
  //   return;
  // }
  // this.presistDataService.addItem(this.name)
  //   .then(res => {
  //     console.log(res);
  //     this.myControl.reset();
  //   })
  //   .catch(e => {
  //     console.log("err: ", e);
  //   })
}
