import {inject, Pipe, PipeTransform} from '@angular/core';
import {map, Observable, of, switchMap} from "rxjs";
import {UsersService} from "../database/users.service";

@Pipe({
  name: 'characterName',
  standalone: true
})
export class CharacterNamePipe implements PipeTransform {

  #usersService = inject(UsersService);

  transform(userId: string): Observable<string> {
    if (userId === 'anonymous') {
      return of('Anonymous');
    }
    return this.#usersService.getOne(userId).pipe(
      switchMap(user => this.#usersService.getCharacter(user.lodestoneId)),
      map(character => character.Character.Name)
    );
  }

}
