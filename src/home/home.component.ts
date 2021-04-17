import { socketServerURL, SocketService } from './../services/socket.service';
import { DataService } from 'src/services/data.service';
import { ChangeDetectorRef, Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { User } from 'src/models/Message';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogData, DialogComponent } from 'src/dialog/dialog.component';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ComponentFactoryResolver } from '@angular/core';
import { ChatComponent } from 'src/chat/chat.component';
import { ComponentFactory } from '@angular/core';
import { Md5 } from 'ts-md5';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;
  public UserList: Array<User> = new Array<User>();
  public subs: Array<Subscription> = new Array<Subscription>()
  public get dataService(): DataService {
    return this._dataService;
  }
  @ViewChild("chatArea", { read: ViewContainerRef })
  container!: ViewContainerRef;

  constructor(private _dataService: DataService, private _snackBar: MatSnackBar,
    private http: HttpClient, private _socketService: SocketService, changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher, public dialog: MatDialog, private router: Router, private resolver: ComponentFactoryResolver) {
    //constructor


    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.subs.push(this._socketService.onGetUsers().subscribe(usersList => {
      this.UserList = usersList;
      console.log("got users list", this.UserList);
    }));
    this.subs.push(this._socketService.onRecievedMessage().subscribe(Message => {
      console.log("got a message", Message);
      if (Message.isGroupChat) {
        var combined: string = ""
        Message.usersList.forEach((element: User) => {
          combined += element.userName;
        });
        var roomIDHash = Md5.hashStr(combined).toString();
        if (this._dataService.componentRefDict.has(roomIDHash)) {
          this._dataService.componentRefDict.get(roomIDHash)?.instance.chats.push(Message.message);
        }
        else {
          const factory: ComponentFactory<ChatComponent> = this.resolver.resolveComponentFactory(ChatComponent);
          var ComponentInstance = this.container.createComponent(factory)
          ComponentInstance.instance.roomID = roomIDHash;
          ComponentInstance.instance.chats.push(Message.message);
          ComponentInstance.instance.users = Message.usersList;
          ComponentInstance.instance.isGroupChat=true;
          this._dataService.componentRefDict.set(roomIDHash, ComponentInstance);
        }
      }
      else {
        if (this._dataService.componentRefDict.has(Message.message.user.userName)) {
          this._dataService.componentRefDict.get(Message.message.user.userName)?.instance.chats.push(Message.message);
        }
        else {
          const factory: ComponentFactory<ChatComponent> = this.resolver.resolveComponentFactory(ChatComponent);
          var ComponentInstance = this.container.createComponent(factory)
          ComponentInstance.instance.roomID = Message.message.user.userName;
          ComponentInstance.instance.chats.push(Message.message);
          this._dataService.componentRefDict.set(Message.message.user.userName, ComponentInstance);
        }
      }
      console.log(this._dataService.componentRefDict)

    }));
    this._socketService.getUsers();
    //constructor ends

  }

  ngOnInit(): void {
  }


  openDialog(command: string, data?: any): void {
    // switch (command) {
    //   case 'createChat':
    //     this._socketService.getUsers();
    //     break;

    //   default:
    //     break;
    // }
    var ddt: DialogData = new DialogData(command, data);
    var dc: MatDialogConfig = new MatDialogConfig();
    dc.data = ddt;
    if (!this.mobileQuery.matches) {
      dc.width = "300px";
      dc.position = {
        right: "50px",
        top: "80px"
      }
    }
    else {
      dc.width = "80vw";
    }
    const dialogRef = this.dialog.open(DialogComponent, dc);

    dialogRef.afterClosed().subscribe((result: DialogData) => {
      console.log('The dialog was closed ', result);
      switch (result?.command) {
        case "createChat":
          console.log(result.data)
          const factory: ComponentFactory<ChatComponent> = this.resolver.resolveComponentFactory(ChatComponent);
          if (!result.data.isGroupChat) {
            if (this._dataService.componentRefDict.get(result.data.user.userName)) {
              console.log("room already created");
              this.openSnackBar("Chat already open", "Done", 3000);
            }
            else {
              var ComponentInstance = this.container.createComponent(factory)
              ComponentInstance.instance.roomID = result.data.user.userName
              this._dataService.componentRefDict.set(result.data.user.userName, ComponentInstance);
            }
          }
          else {
            console.log(result.data.user);
            var combined: string = ""
            result.data.user.forEach((element: any) => {
              combined += element.userName;
            });
            var roomIDHash = Md5.hashStr(combined).toString();
            console.log("group chat room id generated is ", roomIDHash);
            if (this._dataService.componentRefDict.get(roomIDHash)) {
              console.log("room already created");
              this.openSnackBar("Chat already open", "Done", 3000);
            }
            else {
              var ComponentInstance = this.container.createComponent(factory)
              ComponentInstance.instance.roomID = roomIDHash;
              ComponentInstance.instance.isGroupChat = true;
              ComponentInstance.instance.users = result.data.user;
              this._dataService.componentRefDict.set(roomIDHash, ComponentInstance);
            }

          }
          console.log(this._dataService.componentRefDict)

          break;

        default:
          break;
      }
    });
  }
  openSnackBar(message: string, action: string = "Ok", duration: number = 3000,
    horizontalPosition: MatSnackBarHorizontalPosition = 'right',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom') {
    this._snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: horizontalPosition,
      verticalPosition: verticalPosition,
    });
  }

}
