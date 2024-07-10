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
import {Race} from "../model/race";
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {orderBy} from "@angular/fire/firestore";

@Component({
  selector: 'app-races',
  standalone: true,
  imports: [CommonModule, NzCardModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzDatePickerModule, ImageCropperModule, NzSelectModule, NzIconModule, NzUploadModule, NzDividerModule, NzSpinModule, NzTagModule, RouterLink, NzPageHeaderComponent, NzPageHeaderExtraDirective, NzFlexDirective],
  templateUrl: './races.component.html',
  styleUrls: ['./races.component.less']
})
export class RacesComponent {

  #raceService = inject(RaceService);

  #auth = inject(AuthService);

  #dialog = inject(NzModalService);

  public races$ = this.#raceService.query(orderBy('start', 'desc')).pipe(
    map(races => {
      return races.map(race => {
        return {
          ...race,
          status: this.getRaceStatus(race)
        }
      }).sort((a, b) => {
        if (a.stopped) {
          return 1;
        }
        if (b.stopped) {
          return -1;
        }
        return a.start.toMillis() - b.start.toMillis();
      })
    })
  );

  public userIsTracker$ = this.#auth.user$.pipe(
    map(user => user.admin || user.tracker)
  );

  createRace(): void {
    this.#dialog.create({
      nzTitle: 'New race',
      nzContent: RaceCreationPopupComponent,
      nzFooter: null
    });
  }

  getRaceStatus(race: Race): 'ongoing' | 'planned' | 'ended' {
    if (race.stopped) {
      return 'ended';
    }
    if (race.start.toMillis() > Date.now()) {
      return 'planned';
    }
    return 'ongoing';
  }
}
