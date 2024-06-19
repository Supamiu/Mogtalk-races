import {NgModule} from '@angular/core';
import {BrowserModule, provideClientHydration} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {en_US, NZ_I18N} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NzLayoutModule} from "ng-zorro-antd/layout";
import {NzMenuModule} from "ng-zorro-antd/menu";
import {NzBreadCrumbModule} from "ng-zorro-antd/breadcrumb";
import {NZ_ICONS, NzIconModule} from "ng-zorro-antd/icon";
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {environment} from '../environments/environment';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {getFirestore, provideFirestore} from '@angular/fire/firestore';
import {getStorage, provideStorage} from "@angular/fire/storage";
import {NzMessageModule} from "ng-zorro-antd/message";
import {IconDefinition} from '@ant-design/icons-angular';
import {TeamOutline, HomeOutline, UnorderedListOutline} from '@ant-design/icons-angular/icons';
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {NzModalModule} from "ng-zorro-antd/modal";
import {NzAvatarComponent} from "ng-zorro-antd/avatar";
import {NzBadgeComponent} from "ng-zorro-antd/badge";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

registerLocaleData(en);

const icons: IconDefinition[] = [
  HomeOutline,
  UnorderedListOutline,
  TeamOutline
]

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NzLayoutModule,
        NzMenuModule,
        NzBreadCrumbModule,
        NzIconModule,
        NzMessageModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore()),
        provideStorage(() => getStorage()),
        NzButtonComponent,
        NzFlexDirective,
        NzModalModule,
        NzAvatarComponent,
        NzBadgeComponent,
        FontAwesomeModule
    ],
  providers: [
    {provide: NZ_I18N, useValue: en_US},
    {provide: NZ_ICONS, useValue: icons},
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
