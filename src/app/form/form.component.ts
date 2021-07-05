import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PresistDataService } from '../presist-data.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  // Autocomplet Form
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions: Observable<string[]> = of([]);
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  ngOnInit(): void {
    // Autocomplete form
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value: string) => this._filter(value))
    );
  }

  name: string = "";
  items: Observable<any>;

  constructor(private presistDataService: PresistDataService) {
    this.items = presistDataService.getItems();
  }

  onSubmit() {
    this.name = this.name.trim();
    if (!this.name) {
      return;
    }
    this.presistDataService.addItem(this.name)
      .then(res => {
        console.log(res);
        this.myControl.reset();
      })
      .catch(e => {
        console.log("err: ", e);
      })
  }

}
