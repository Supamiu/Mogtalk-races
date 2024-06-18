import {Component, inject} from '@angular/core';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";
import {Team} from "../../model/team";
import {Race} from "../../model/race";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {Timestamp} from "@angular/fire/firestore";
import {getDownloadURL, ref, Storage, uploadBytes} from "@angular/fire/storage";
import {ClearReportsService} from "../../database/clear-reports.service";
import {Observable, of, startWith, switchMap, tap, withLatestFrom} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService} from "../../auth/auth.service";
import {HistoryService} from "../../database/history.service";
import {HistoryEntryType} from "../../model/history-entry";
import {AsyncPipe, JsonPipe} from "@angular/common";
import {NzCheckboxComponent} from "ng-zorro-antd/checkbox";
import {DATACENTERS} from "../../core/game-data";
import {NzCardComponent} from "ng-zorro-antd/card";
import {ClearReport} from "../../model/clear-report";

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
    NzDividerComponent,
    AsyncPipe,
    NzCheckboxComponent,
    FormsModule,
    NzInputGroupComponent,
    NzRowDirective,
    NzCardComponent,
    JsonPipe
  ],
  templateUrl: './clear-report-dialog.component.html',
  styleUrl: './clear-report-dialog.component.less'
})
export class ClearReportDialogComponent {
  #afs = inject(Storage);

  #reportsService = inject(ClearReportsService);

  #historyService = inject(HistoryService);

  #ref = inject(NzModalRef);

  #auth = inject(AuthService);

  #message = inject(NzMessageService);

  readonly datacenters = DATACENTERS;

  data: { teams: Team[], race: Race } = inject(NZ_MODAL_DATA);

  customTeamForm = false;

  loading = false;

  form = new FormGroup({
    team: new FormControl<Team | null>(null),
    date: new FormControl(new Date(), Validators.required),
    phase: new FormControl('', this.data.race.phases.length > 0 ? Validators.required : []),
    screenshot: new FormControl(''),
    url: new FormControl(''),
    customTeamName: new FormControl(''),
    customTeamDatacenter: new FormControl(''),
    customTeamStream: new FormControl(''),
  });

  screenshot: File | null = null;

  userIsTracker$ = this.#auth.userIsTracker$;

  fileChange(event: any): void {
    const files = event.target.files;
    this.screenshot = files.item(0);
  }

  submit(): void {
    this.loading = true;
    const raw: any = this.form.getRawValue();
    const reportId = this.#reportsService.generateId();
    if ((!raw.team && !raw.customTeamName && !raw.customTeamDatacenter) || (this.data.race.phases?.length > 0 && !raw.phase) || !raw.date) {
      this.loading = false;
      return;
    }
    this.userIsTracker$.pipe(
      switchMap(userIsTracker => {
        const screenshot$ = new Observable<string>(observer => {
          const fileRef = ref(this.#afs, `clear-reports/${this.data.race.name}/${raw.team?.name || raw.customTeamName}/${reportId}.png`);
          this.screenshot?.arrayBuffer().then(buffer => {
            uploadBytes(fileRef, buffer, {contentType: this.screenshot?.type}).then(snap => {
              getDownloadURL(snap.ref).then(url => {
                observer.next(url);
                observer.complete();
              })
            })
          });
        });

        const source$: Observable<null | string> = ((userIsTracker || raw.url) && !this.screenshot) ? of('') : screenshot$;

        return source$
          .pipe(
            withLatestFrom(this.#auth.user$.pipe(startWith(null))),
            switchMap(([url, user]) => {
              const report: Partial<ClearReport> = {
                date: Timestamp.fromDate(raw.date),
                phase: raw.phase || null,
                screenshot: url || '',
                url: raw.url || '',
                race: this.data.race.$key || '',
                raceName: this.data.race?.name,
                accepted: userIsTracker
              }
              if (this.customTeamForm) {
                report.teamName = raw.customTeamName;
                report.customTeam = {
                  name: raw.customTeamName,
                  datacenter: raw.customTeamDatacenter,
                  streams: raw.customTeamStream ? [raw.customTeamStream] : []
                }
              } else {
                report.team = raw.team.$key;
                report.teamName = raw.team.name;
              }
              return this.#reportsService.setOne(reportId, report as ClearReport).pipe(
                switchMap(() => {
                  return this.#historyService.addOne({
                    author: user?.$key || 'anonymous',
                    date: Timestamp.now(),
                    type: userIsTracker ? HistoryEntryType.REPORT_ACCEPTED : HistoryEntryType.REPORT_SUBMITTED,
                    report: {
                      $key: reportId,
                      ...report as ClearReport
                    }
                  })
                })
              )
            })
          )
      })
    ).subscribe(() => {
      this.#message.success("Clear report submitted, thanks !");
      this.#ref.close();
    });
  }
}
