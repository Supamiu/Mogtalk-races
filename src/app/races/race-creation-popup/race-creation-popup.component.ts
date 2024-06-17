import {Component, inject} from '@angular/core';
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ImageCropperModule} from "ngx-image-cropper";
import {NgForOf, NgIf} from "@angular/common";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzCardComponent} from "ng-zorro-antd/card";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {NzSpinComponent} from "ng-zorro-antd/spin";
import {NzWaveDirective} from "ng-zorro-antd/core/wave";
import {Race} from "../../model/race";
import {NzMessageService} from "ng-zorro-antd/message";
import {RaceService} from "../../database/race.service";
import {NzModalRef} from "ng-zorro-antd/modal";
import {Timestamp} from "@angular/fire/firestore";

@Component({
  selector: 'app-race-creation-popup',
  standalone: true,
  imports: [
    FormsModule,
    ImageCropperModule,
    NgForOf,
    NgIf,
    NzButtonComponent,
    NzCardComponent,
    NzColDirective,
    NzDatePickerComponent,
    NzDividerComponent,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzIconDirective,
    NzInputDirective,
    NzInputGroupComponent,
    NzOptionComponent,
    NzRowDirective,
    NzSelectComponent,
    NzSpinComponent,
    NzWaveDirective,
    ReactiveFormsModule
  ],
  templateUrl: './race-creation-popup.component.html',
  styleUrl: './race-creation-popup.component.less'
})
export class RaceCreationPopupComponent {
  #raceService = inject(RaceService);

  #notification = inject(NzMessageService);

  #ref = inject(NzModalRef);

  newRaceForm = new FormGroup({
    name: new FormControl('', Validators.required),
    start: new FormControl<number>(Date.now()),
    type: new FormControl('', Validators.required),
    phases: new FormArray<FormControl<string | null>>([])
  });

  removePhase(index: number): void {
    this.newRaceForm.controls.phases.removeAt(index);
  }

  addPhase(): void {
    this.newRaceForm.controls.phases.push(new FormControl(`P${this.newRaceForm.controls.phases.length + 1}`, Validators.required))
  }

  createRace(): void {
    const race: Race = {
      ...(this.newRaceForm.getRawValue() as any),
      teams: []
    };
    race.start = Timestamp.fromMillis(this.newRaceForm.getRawValue().start as number);

    this.#raceService.addOne(race).subscribe(() => {
      this.#notification.success('Race has been created !');
      this.newRaceForm.reset();
      this.#ref.close();
    });
  }
}
