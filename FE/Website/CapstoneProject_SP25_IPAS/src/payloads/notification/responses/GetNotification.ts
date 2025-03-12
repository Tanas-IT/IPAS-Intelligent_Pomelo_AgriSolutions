export interface GetNotification {
    notificationId: number;
    title: string;
    content: string;
    isRead: boolean;
    createDate: string;
    color: string;
    link: string;
    masterType: {
      masterTypeId: number;
      masterTypeName: string;
    };
    sender: {
        id: number;
        name: string;
        avt: string;
    }
  }
  