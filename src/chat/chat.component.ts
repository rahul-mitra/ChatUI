import { DataService } from 'src/services/data.service';
import { SocketService } from './../services/socket.service';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Message, User } from 'src/models/Message';
import { TemplateRef } from '@angular/core';
import { ElementRef } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input("roomID")
  public roomID: string | undefined;

  @ViewChild("chatWindow")
  public chatWindow!: ElementRef;

  public text: string | undefined;
  public unifiedName!: string
  public isGroupChat: boolean | undefined;
  public chats: Array<Message> = new Array<Message>();
  public users!: Array<User>;
  // public selectedFile!:File
  public get dataService(): DataService {
    return this._dataService;
  }

  constructor(private socketService: SocketService, private _dataService: DataService) {

  }
  ngAfterViewInit(): void {
    console.log(this.chatWindow);
    if (this.chatWindow) {
      debugger;
      var col1 = "#" + this.RandomHex()+"4a";
      var col2 = "#" + this.RandomHex()+"4a";
      // this.chatWindow.nativeElement.style.backgroundImage = "red";
      var setCol = `linear-gradient(120deg, ${col1} 0%, ${col2} 100%)`;
      this.chatWindow.nativeElement.style.backgroundImage = setCol;
      console.log(this.chatWindow.nativeElement.style.backgroundImage);
    }
  }
  ngOnDestroy(): void {
    if (this.roomID) {
      console.log("Removing chat component with room id [%s] removal status [%s]",
        this.roomID, this.dataService.componentRefDict.delete(this.roomID));
      if (this.isGroupChat) {
        this.socketService.leaveRoom(this.roomID);
      }
    }
  }

  closeChat() {
    if (this.roomID) {
      this.dataService.removeChat(this.roomID);
    }
  }

  public RandomHex() {
    return Math.floor(Math.random() * 16777215).toString(16);
  }

  ngOnInit(): void {
    if (this.isGroupChat && this.roomID) {
      console.log("user list in chat is ", this.users);
      this.unifiedName = this.users.map(u => u.userName).join(" ")
      this.socketService.joinRoom(this.roomID, this.users);
    }
  }
  public sendText() {
    if (this.dataService.User && this.text && this.roomID) {
      var recipient = new User(this.roomID)
      var message = new Message(this.dataService.User, this.text, new Date)

      if (!this.isGroupChat) {
        this.chats.push(message);
        this.socketService.sendMessage(message, recipient, false);
      }
      else
        this.socketService.sendMessage(message, recipient, true, this.roomID, this.users);
      this.text = undefined;
    }
  }



  // onFileSelect(event:Event) {
  //   this.selectedFile = event?.target.files[0];
  //   this.name = this.selectedFile.name;
  //   console.log(this.selectedFile);
  // }
}
