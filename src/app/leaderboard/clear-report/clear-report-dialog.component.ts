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
import {Observable, switchMap} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";

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

  #message = inject(NzMessageService);

  data: { teams: Team[], race: Race } = inject(NZ_MODAL_DATA);

  loading = false;

  form = new FormGroup({
    team: new FormControl<Team | null>(null, Validators.required),
    date: new FormControl(new Date(), Validators.required),
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
    const fileRef = ref(this.#afs, `clear-reports/${this.data.race.$key}/${raw.team.name}/${raw.phase || 'clear'}-${raw.date.toISOString()}-${this.screenshot.name}`);
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
      switchMap(url => {
        return this.#reportsService.addOne({
          date: Timestamp.fromDate(raw.date),
          team: raw.team.$key,
          phase: raw.phase || null,
          screenshot: url
        })
      })
    ).subscribe(() => {
      this.#message.success("Clear report submitted, thanks !");
      this.#ref.close();
    });
  }
}
