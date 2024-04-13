import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzCardModule} from "ng-zorro-antd/card";
import {ReactiveFormsModule} from "@angular/forms";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzDatePickerModule} from "ng-zorro-antd/date-picker";
import {ImageCropperModule} from "ngx-image-cropper";
import {RaceService} from "../database/race.service";
import {NzSelectModule} from "ng-zorro-antd/select";
import {NzIconModule} from "ng-zorro-antd/icon";
import {NzUploadModule} from "ng-zorro-antd/upload";
import {NzDividerModule} from "ng-zorro-antd/divider";
import {NzSpinModule} from "ng-zorro-antd/spin";
import {NzTagModule} from "ng-zorro-antd/tag";
import {RouterLink} from "@angular/router";
import {AuthService} from "../auth/auth.service";
import {map} from "rxjs";
import {NzPageHeaderComponent, NzPageHeaderExtraDirective} from "ng-zorro-antd/page-header";
import {NzModalService} from "ng-zorro-antd/modal";
import {RaceCreationPopupComponent} from "./race-creation-popup/race-creation-popup.component";

@Component({
  selector: 'app-races',
  standalone: true,
  imports: [CommonModule, NzCardModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzDatePickerModule, ImageCropperModule, NzSelectModule, NzIconModule, NzUploadModule, NzDividerModule, NzSpinModule, NzTagModule, RouterLink, NzPageHeaderComponent, NzPageHeaderExtraDirective],
  templateUrl: './races.component.html',
  styleUrls: ['./races.component.less']
})
export class RacesComponent {

  #raceService = inject(RaceService);

  #auth = inject(AuthService);

  #dialog = inject(NzModalService);

  public races$ = this.#raceService.query();
  public isAdmin$ = this.#auth.user$.pipe(
    map(user => user.admin)
  );

  createRace(): void {
    this.#dialog.create({
      nzTitle: 'New race',
      nzContent: RaceCreationPopupComponent,
      nzFooter: null
    });
  }
}
