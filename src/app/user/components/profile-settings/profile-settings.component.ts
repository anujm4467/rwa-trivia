import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { UserActions } from '../../../core/store/actions';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { AppStore } from '../../../core/store/app-store';
import { Utils } from '../../../core/services';
import { User, Category } from '../../../model';
import { ImageCropperComponent, CropperSettings, Bounds } from 'ngx-img-cropper';
import { AngularFireStorage } from 'angularfire2/storage';


@Component({
  selector: 'profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  @Input() user: User;

  // Properties
  categories: Category[];
  categoryDict: { [key: number]: Category };
  categoryDictObs: Observable<{ [key: number]: Category }>;
  subs: Subscription[] = [];
  categoriesObs: Observable<Category[]>;
  userForm: FormGroup;
  profileOptions: string[] = ['Only with friends', 'General', 'Programming', 'Architecture'];

  userObs: Observable<User>;

  profileImage: { image: any } = { image: '/assets/images/avatarimg.jpg' };
  basePath = '/profile';
  profileImagePath = 'avatar';
  originalImagePath = 'original';
  profileImageValidation: String;
  profileImageFile: File;

  originalUserObject: User;

  cropperSettings: CropperSettings;


  tagsObs: Observable<string[]>;
  tags: string[];
  tagsAutoComplete: string[];
  autoTags: string[] = []; // auto computed based on match within Q/A
  enteredTags: string[] = [];

  filteredTags$: Observable<string[]>;

  linkValidation = "^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$";

  get tagsArray(): FormArray {
    return this.userForm.get('tagsArray') as FormArray;
  }


  @ViewChild('cropper') cropper: ImageCropperComponent;

  get categoryList(): FormArray {
    return this.userForm.get('categoryList') as FormArray;
  }

  get socialAccountList(): FormArray {
    return this.userForm.get('socialAccountList') as FormArray;
  }

  constructor(private fb: FormBuilder,
    private store: Store<AppStore>,
    private storage: AngularFireStorage,
    private userActions: UserActions,
    private snackBar: MatSnackBar) {
    this.subs.push(this.store.take(1).subscribe(s => this.user = s.user));
    this.categoriesObs = store.select(s => s.categories);
    this.subs.push(this.categoriesObs.subscribe(categories => this.categories = categories));
    this.categoryDictObs = store.select(s => s.categoryDictionary);
    this.subs.push(this.categoryDictObs.subscribe(categoryDict => this.categoryDict = categoryDict));
    this.tagsObs = store.select(s => s.tags);
    this.setCropperSettings();
  }

  private setCropperSettings() {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.noFileInput = true;
    this.cropperSettings.width = 150;
    this.cropperSettings.height = 140;
    this.cropperSettings.croppedWidth = 150;
    this.cropperSettings.croppedHeight = 140;
    this.cropperSettings.canvasWidth = 300;
    this.cropperSettings.canvasHeight = 280;
    this.cropperSettings.minWidth = 10;
    this.cropperSettings.minHeight = 10;
    this.cropperSettings.rounded = false;
    this.cropperSettings.keepAspect = false;
    this.cropperSettings.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings.cropperDrawSettings.strokeWidth = 2;
  }

  // Lifecycle hooks
  ngOnInit() {
    this.store.dispatch(this.userActions.loadUserProfile(this.user));
    this.userObs = this.store.select(s => s.user);
    this.subs.push(this.userObs.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.originalUserObject = this.user;
        this.createForm(this.user);
        if (this.user.profilePicture) {
          const filePath = `${this.basePath}/${this.user.userId}/${this.profileImagePath}/${this.user.profilePicture}`;
          const ref = this.storage.ref(filePath);
          ref.getDownloadURL().subscribe(res => {
            this.profileImage.image = res;
          });
        }
      }
    }));

    this.subs.push(this.tagsObs.subscribe(tags => this.tagsAutoComplete = tags));

    this.subs.push(this.store.select(s => s.userProfileSaveStatus)
      .subscribe(status => {
        if (status === 'SUCCESS') {
          this.snackBar.open('Profile saved!', '', { duration: 2000 });
        }
      }));


    this.filteredTags$ = this.userForm.get('tagsModel').valueChanges
      .map(val => val.length > 0 ? this.filter(val) : []);

  }

  filter(val: string): string[] {
    return this.tagsAutoComplete.filter(option => new RegExp(Utils.regExpEscape(`${val}`), 'gi').test(option));
  }

  onFileChange($event) {
    this.validateImage($event.target.files);
    if (!this.profileImageValidation) {
      const image = new Image();
      this.profileImageFile = $event.target.files[0];
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(this.profileImageFile);
      reader.onloadend = (loadEvent: any) => {
        image.src = loadEvent.target.result;
        this.cropper.setImage(image);
      };
    }
  }

  validateImage(fileList: FileList) {
    if (fileList.length === 0) {
      this.profileImageValidation = 'Please select Profile picture';
    } else {
      const file: File = fileList[0];
      const fileName = file.name;
      const fileSize = file.size;
      const fileType = file.type;

      if (fileSize > 2097152) {
        this.profileImageValidation = 'Your uploaded Profile is not larger than 2 MB.';
      } else {
        if (fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/png' || fileType === 'image/gif') {
          this.profileImageValidation = undefined;
        } else {
          this.profileImageValidation = 'Only PNG, GIF, JPG and JPEG Type Allow.';
        }
      }
    }
  }

  saveProfileImage() {
    if (!this.profileImageValidation) {
      const file = this.profileImageFile
      const imageBlob = this.dataURItoBlob(this.profileImage.image);
      const fileName = `${new Date().getTime()}-${this.profileImageFile.name}`;
      this.storage.upload(`${this.basePath}/${this.user.userId}/${this.originalImagePath}/${fileName}`, this.profileImageFile);
      if (imageBlob) {
        // tslint:disable-next-line:max-line-length
        const cropperImageUploadTask = this.storage.upload(`${this.basePath}/${this.user.userId}/${this.profileImagePath}/${fileName}`, imageBlob);
        cropperImageUploadTask.downloadURL().subscribe(url => {
          this.profileImage.image = url ? url : '/assets/images/avatarimg.jpg';
          this.user.profilePicture = fileName;
          this.profileImageFile = undefined;
          this.saveUser(this.user);
        });
      }
    }
  }

  // cropped image convert to blob object
  dataURItoBlob(dataURI: any) {
    const binary = atob(dataURI.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: this.profileImageFile.type
    });
  }

  // create the form based on user object
  createForm(user: User) {
    const categoryIds: FormGroup[] = this.categories.map(category => {
      const status = (user.categoryIds && user.categoryIds.indexOf(category.id) !== -1) ? true : false
      const fg = new FormGroup({
        category: new FormControl(category.id),
        isSelected: new FormControl(status),
      });
      return fg;
    });

    if (user.tags === undefined) {
      const a = [];
      user.tags = a;
    }

    let fcs: FormControl[] = user.tags.map(tag => {
      const fc = new FormControl(tag);
      return fc;
    });
    if (fcs.length === 0) {
      fcs = [new FormControl('')];
    }
    const tagsFA = new FormArray(fcs);


    const categoryFA = new FormArray(categoryIds);
    this.userForm = this.fb.group({
      name: [user.name],
      displayName: [user.displayName, Validators.required],
      location: [user.location],
      categoryList: categoryFA,
      tagsModel: '',
      tagsArray: tagsFA,
      facebookUrl: [user.facebookUrl],
      twitterUrl: [user.twitterUrl],
      linkedInUrl: [user.linkedInUrl],
      profileSetting: [(user.profileSetting) ? user.profileSetting :
        (this.profileOptions.length > 0 ? this.profileOptions[0] : '')],
      profileLocationSetting: [(user.profileLocationSetting) ? user.profileLocationSetting :
        (this.profileOptions.length > 0 ? this.profileOptions[0] : '')],
      privateProfileSetting: [user.privateProfileSetting],
      profilePicture: [user.profilePicture]
    });

    this.enteredTags = user.tags;
  }

  // tags start
  // Event Handlers
  addTag() {
    const tag = this.userForm.get('tagsModel').value;
    if (tag) {
      if (this.enteredTags.indexOf(tag) < 0) {
        this.enteredTags.push(tag);
      }
      this.userForm.get('tagsModel').setValue('');
    }
    this.setTagsArray();
  }

  removeEnteredTag(tag) {
    this.enteredTags = this.enteredTags.filter(t => t !== tag);
    this.setTagsArray();
  }

  computeAutoTags() {
    const formValue = this.userForm.value;
    const allTextValues: string[] = [formValue.questionText];
    formValue.answers.forEach(answer => allTextValues.push(answer.answerText));
    const wordString: string = allTextValues.join(' ');
    const matchingTags: string[] = [];
    this.tags.forEach(tag => {
      const part = new RegExp('\\b(' + tag.replace('+', '\\+') + ')\\b', 'ig');
      if (wordString.match(part)) {
        matchingTags.push(tag);
      }
    });
    this.autoTags = matchingTags;
    this.setTagsArray();
  }

  setTagsArray() {
    this.tagsArray.controls = [];
    [...this.autoTags, ...this.enteredTags].forEach(tag => this.tagsArray.push(new FormControl(tag)));
  }
  // tags end

  getUserFromFormValue(formValue: any): void {
    this.user.name = formValue.name;
    this.user.displayName = formValue.displayName;
    this.user.location = formValue.location;
    this.user.categoryIds = [];
    for (const obj of formValue.categoryList) {
      if (obj['isSelected']) {
        this.user.categoryIds.push(obj['category']);
      }
    }
    this.user.facebookUrl = formValue.facebookUrl;
    this.user.linkedInUrl = formValue.linkedInUrl;
    this.user.twitterUrl = formValue.twitterUrl;
    this.user.tags = this.enteredTags;
    this.user.profileSetting = formValue.profileSetting;
    this.user.profileLocationSetting = formValue.profileLocationSetting;
    this.user.privateProfileSetting = formValue.privateProfileSetting;
    this.user.profilePicture = formValue.profilePicture ? formValue.profilePicture : '';
  }


  resetUserProfile() {
    this.user = this.originalUserObject;
    this.createForm(this.user);
  }

  onSubmit() {
    // validations
    this.userForm.updateValueAndValidity();
    if (this.userForm.invalid) {
      return;
    }
    // get user object from the forms
    this.getUserFromFormValue(this.userForm.value);
    // call saveUser
    this.saveUser(this.user);
  }

  // store the user object
  saveUser(user: User) {
    this.store.dispatch(this.userActions.addUserProfile(user));
  }

  ngOnDestroy() {
    Utils.unsubscribe(this.subs);
  }

}
