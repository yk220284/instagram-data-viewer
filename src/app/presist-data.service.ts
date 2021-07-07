import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
export interface Item { shortcode: string, name: string; }
export interface ImageUrl { shortcode: string, url: string; }

@Injectable({
  providedIn: 'root'
})
export class PresistDataService {
  private itemsCollection: AngularFirestoreCollection<Item>;
  private imageUrlCollection: AngularFirestoreCollection<ImageUrl>;
  private items: Observable<Item[]>;

  constructor(
    private afs: AngularFirestore,
    private imageStorage: AngularFireStorage
  ) {
    this.itemsCollection = afs.collection<Item>('test');
    this.imageUrlCollection = afs.collection<ImageUrl>('imageUrl');
    this.items = this.itemsCollection.valueChanges({ idField: 'shortcode' });
  }

  uploadImage(imageFile: File) {
    // The storage path
    const fileNameNoExt: string = imageFile.name.split('.').slice(0, -1).join('.');
    const filePath = `/img/${fileNameNoExt}.png`;
    const fileRef = this.imageStorage.ref(filePath);

    const task = this.imageStorage.upload(filePath, imageFile);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => this.addImageUrl(fileNameNoExt, url));
      }
      )).subscribe();
    return task;
  }

  addImageUrl(shortcode: string, url: string) {
    const imageUrl: ImageUrl = { shortcode: shortcode, url: url };
    return this.imageUrlCollection.doc(shortcode).set(imageUrl);
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
