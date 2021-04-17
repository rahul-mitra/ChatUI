import { ComponentRef, EventEmitter, Injectable } from '@angular/core';

import { ChatComponent } from 'src/chat/chat.component';
import { User } from 'src/models/Message';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public isLogged: boolean = false;
  public User: User | null = null;
  componentRefDict: Map<string, ComponentRef<ChatComponent>> = new Map<string, ComponentRef<ChatComponent>>();

  public removeChat(roomID: string) {
    this.componentRefDict.get(roomID)?.destroy();
    this.componentRefDict.delete(roomID);
  }


  constructor() { }
}
