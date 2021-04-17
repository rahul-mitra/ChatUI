import { ExtendedMessage } from './../models/Message';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Message, User } from 'src/models/Message';

export const socketServerURL: string = "http://localhost:3000"
// export const socketServerURL: string = "http://192.168.1.4:3000"
// export const socketServerURL: string = "https://rh-chat-server.herokuapp.com";
const options = {
  reconnectionDelayMax: 10000,
  reconnectionAttempts: 5,
  transports: ["websocket"],
  upgrade: false,
  reconnection: true,
  query: {
    userName: "not set"
  }
}
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socketClient!: Socket;
  constructor() {
  }
  public async initSocket(userName: string): Promise<boolean> {
    options.query.userName = userName
    this.socketClient = await io(socketServerURL, options);
    console.log("socket initialized");
    if (this.socketClient)
      return Promise.resolve(true);
    return Promise.reject(false);
  }
  public onConnected(): Observable<any> {
    var observer = new Observable<any>((observer) => {
      this.socketClient.on("connect", () => {
        observer.next("Connected to server")
      });
    });
    return observer;
  }
  public disconnect() {
    this.socketClient.disconnect();
  }
  public testServer() {
    // console.log("Connection status ",this.socketClient.connected);
    this.socketClient.emit("testServer", "testing 123");
  }

  public onTestServer(): Observable<string> {
    var observer = new Observable<string>((observer) => {
      this.socketClient.on("testServer", (response: any) => {
        observer.next(response)
      });
    });
    return observer;
  }
  public onServerMessage(): Observable<string> {
    var observer = new Observable<string>((observer) => {
      this.socketClient.on("serverMessage", (response: string) => {
        observer.next(response)
      });
    });
    return observer;
  }

  public sendMessage(message: Message, recipient: User, isGroupChat: boolean = false, roomID?: string, usersList?: Array<User>) {
    this.socketClient.emit("message", message, recipient, isGroupChat, roomID, usersList)
  }


  public onRecievedMessage(): Observable<ExtendedMessage> {
    return new Observable<ExtendedMessage>((observer) => {
      this.socketClient.on("recievedMessage", (message: ExtendedMessage) => {
        observer.next(message)
      });
    });
  }

  public getUsers() {
    this.socketClient.emit("getUsers")
  }
  public joinRoom(roomIDHash: string, usersList: Array<User>) {
    this.socketClient.emit("joinGroup", roomIDHash, usersList)
  }
  public leaveRoom(roomIDHash: string) {
    this.socketClient.emit("leaveGroup", roomIDHash)
  }
  public onGetUsers(): Observable<Array<User>> {
    return new Observable<Array<User>>((observer) => {
      this.socketClient.on("getUsers", (users: Array<User>) => {
        observer.next(users)
      });
    });
  }
}
