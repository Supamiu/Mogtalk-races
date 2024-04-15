import {Component, inject} from '@angular/core';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzColDirective} from "ng-zorro-antd/grid";
import {NzInputDirective} from "ng-zorro-antd/input";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";
import {Team} from "../../model/team";
import {Race} from "../../model/race";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {Timestamp} from "@angular/fire/firestore";
import {getDownloadURL, ref, Storage, uploadBytes} from "@angular/fire/storage";
import {ClearReportsService} from "../../database/clear-reports.service";
import {Observable, switchMap, withLatestFrom} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-clear-report-dialog',
  standalone: true,
  imports: [
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzColDirective,
    NzInputDirective,
    NzSelectComponent,
    ReactiveFormsModule,
    NzOptionComponent,
    NzDatePickerComponent,
    NzButtonComponent,
    NzDividerComponent
  ],
  templateUrl: './clear-report-dialog.component.html',
  styleUrl: './clear-report-dialog.component.less'
})
export class ClearReportDialogComponent {
  #afs = inject(Storage);

  #reportsService = inject(ClearReportsService);

  #ref = inject(NzModalRef);

  #auth = inject(AuthService);

  #message = inject(NzMessageService);

  data: { teams: Team[], race: Race } = inject(NZ_MODAL_DATA);

  loading = false;

  form = new FormGroup({
    team: new FormControl<Team | null>(null, Validators.required),
    date: new FormControl(new Date(), Validators.required),
    phase: new FormControl('', this.data.race.phases.length > 0 ? Validators.required : []),
    screenshot: new FormControl(''),
  });

  screenshot: File | null = null;

  fileChange(event: any): void {
    const files = event.target.files;
    this.screenshot = files.item(0);
  }

  submit(): void {
    this.loading = true;
    if (!this.screenshot) {
      return;
    }
    const raw: any = this.form.getRawValue();
    const reportId = this.#reportsService.generateId();
    const fileRef = ref(this.#afs, `clear-reports/${this.data.race.name}/${raw.team.name}/${reportId}.png`);
    new Observable<string>(observer => {
      this.screenshot?.arrayBuffer().then(buffer => {
        uploadBytes(fileRef, buffer, {contentType: this.screenshot?.type}).then(snap => {
          getDownloadURL(snap.ref).then(url => {
            observer.next(url);
            observer.complete();
          })
        })
      });
    }).pipe(
      withLatestFrom(this.#auth.userIsTracker$),
      switchMap(([url, userIsTracker]) => {
        return this.#reportsService.setOne(reportId, {
          date: Timestamp.fromDate(raw.date),
          team: raw.team.$key,
          teamName: raw.team.name,
          phase: raw.phase || null,
          screenshot: url,
          race: this.data.race.$key || '',
          raceName: this.data.race?.name,
          accepted: userIsTracker
        })
      })
    ).subscribe(() => {
      this.#message.success("Clear report submitted, thanks !");
      this.#ref.close();
    });
  }
}
