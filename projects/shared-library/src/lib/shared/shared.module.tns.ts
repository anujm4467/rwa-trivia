import { CommonModule } from '@angular/common';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {
  ActionBarComponent, DrawerComponent, CountryListComponent, QuestionsTableComponent,
  SelectCategoryTagComponent
} from './mobile/component';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { GameFilterPipe } from './pipe/game-filter.pipe';
import { SearchCountryFilterPipe } from './pipe/search-country-filter.pipe';
import { TNSCheckBoxModule } from 'nativescript-checkbox/angular';
import { NativeScriptUIAutoCompleteTextViewModule } from 'nativescript-ui-autocomplete/angular';
import { NativeScriptUIListViewModule } from 'nativescript-ui-listview/angular';
import { RenderQuestionComponent, AuthorComponent, RenderAnswerComponent,
  UserCardComponent, UserReactionComponent, SignupExtraInfoComponent, CheckDisplayNameComponent } from './components';
import { ShowHintWhenFocusOutDirective, OpenUserProfileDirective, RippleEffectDirective } from './directive';
import { PhoneNumberValidationProvider } from './mobile/component/countryList/phone-number-validation.provider';
import { SafeHtmlPipe } from './pipe/safe-html.pipe';
@NgModule({
  declarations: [
    ActionBarComponent,
    DrawerComponent,
    QuestionsTableComponent,
    AuthorComponent,
    RenderAnswerComponent,
    RenderQuestionComponent,
    CountryListComponent,
    UserCardComponent,
    GameFilterPipe,
    SearchCountryFilterPipe,
    SafeHtmlPipe,
    ShowHintWhenFocusOutDirective,
    OpenUserProfileDirective,
    RippleEffectDirective,
    UserReactionComponent,
    SelectCategoryTagComponent,
    SignupExtraInfoComponent,
    CheckDisplayNameComponent
  ],
  imports: [
    CommonModule,

    // http client
    HttpClientModule,
    // Forms
    RouterModule,
    HttpClientModule,       // for share counts
    NativeScriptCommonModule,

    NativeScriptFormsModule,
    ReactiveFormsModule,
    TNSCheckBoxModule,
    NativeScriptUIAutoCompleteTextViewModule,
    NativeScriptUIListViewModule,
  ],
  exports: [
    CommonModule, HttpClientModule,
    NativeScriptFormsModule,
    ReactiveFormsModule,
    TNSCheckBoxModule,
    NativeScriptCommonModule,
    NativeScriptUIAutoCompleteTextViewModule,
    NativeScriptUIListViewModule,
    HttpClientModule,
    ActionBarComponent,
    DrawerComponent,
    QuestionsTableComponent,
    AuthorComponent,
    GameFilterPipe,
    SearchCountryFilterPipe,
    ShowHintWhenFocusOutDirective,
    OpenUserProfileDirective,
    RippleEffectDirective,
    RenderAnswerComponent,
    RenderQuestionComponent,
    UserReactionComponent,
    SelectCategoryTagComponent,
    UserCardComponent,
    SignupExtraInfoComponent,
    CheckDisplayNameComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  entryComponents: [
    CountryListComponent,
    RenderQuestionComponent
  ],
  providers: [
    PhoneNumberValidationProvider
  ]
})
export class SharedModule { }
