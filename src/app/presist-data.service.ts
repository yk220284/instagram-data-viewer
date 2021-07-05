import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
export interface Item { shortcode: string, name: string; }

@Injectable({
  providedIn: 'root'
})
export class PresistDataService {
  private itemsCollection: AngularFirestoreCollection<Item>;
  private items: Observable<Item[]>;
  constructor(private afs: AngularFirestore) {
    this.itemsCollection = afs.collection<Item>('test');
    this.items = this.itemsCollection.valueChanges({ idField: 'shortcode' });
  }

  addItem(name: string) {
    const shortcode = this.afs.createId();
    const item: Item = { shortcode, name };
    console.log(item);
    return this.itemsCollection.doc(shortcode).set(item);
  }

  getItems(): Observable<Item[]> {
    return this.items
  }
}
