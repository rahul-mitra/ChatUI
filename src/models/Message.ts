export class Message {
  user: User;
  message: string;
  hasAttachment: boolean;
  time: Date;
  attachment?: File;
  constructor(user: User, message: string, time: Date, hasAttachment: boolean = false, attachment?: File) {
    this.user = user; this.message = message; this.hasAttachment = hasAttachment; this.attachment = attachment;
    this.time = time;
  }
}
export class ExtendedMessage {
  message: Message;
  isGroupChat: boolean;
  roomID: string;
  usersList: Array<User>;
  constructor(message: Message,
    isGroupChat: boolean,
    roomID: string,
    usersList: Array<User>) {
    this.isGroupChat = isGroupChat; this.roomID = roomID; this.message = message; this.usersList = usersList

  }
}
export class User {
  userName: string;

  constructor(userName: string) {
    this.userName = userName;
  }
}


