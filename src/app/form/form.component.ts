import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PresistDataService } from '../presist-data.service';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  // Autocomplet Form
  profileForm = new FormGroup({
    userName: new FormControl('', [Validators.required, forbiddenNameValidator(/ /i)]),
    fullName: new FormControl(''),
  });
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]> = of([]);
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  ngOnInit(): void {
    // Autocomplete form
    this.filteredOptions = this.profileForm.get("userName")!.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filter(value))
    );
  }
  // items: Observable<any>;

  constructor(private presistDataService: PresistDataService) {
    // this.items = presistDataService.getItems();
  }
  validateFormControl(formControlName: string) {
    let control = this.profileForm.get(formControlName);
    return control!.invalid && (control!.dirty || control!.touched);
  }

  onSubmit() {
    console.warn(this.profileForm.value);

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

}
