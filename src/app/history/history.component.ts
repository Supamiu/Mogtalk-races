import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {NzPageHeaderComponent} from "ng-zorro-antd/page-header";
import {NzTableModule} from "ng-zorro-antd/table";
import {AsyncPipe, DatePipe} from "@angular/common";
import {HistoryService} from "../database/history.service";
import {HistoryEntryType} from "../model/history-entry";
import {map} from "rxjs";
import {CharacterNamePipe} from "./character-name.pipe";

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    NzPageHeaderComponent,
    NzTableModule,
    AsyncPipe,
    DatePipe,
    CharacterNamePipe
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent {

  HistoryEntryType = HistoryEntryType;

  #historyService = inject(HistoryService);

  history$ = this.#historyService.query().pipe(
    map(entries => entries.sort((a, b) => b.date.toMillis() - a.date.toMillis()))
  );
}
