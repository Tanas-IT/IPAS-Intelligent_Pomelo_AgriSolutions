using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Common.Utils
{
    public class FirebaseLibrary
    {

        public static async Task<string> SendMessageFireBase(string title, string body, string token)
        {
            var message = new Message()
            {
                Notification = new Notification()
                {
                    Title = title,
                    Body = body,
                    ImageUrl = "https://res.cloudinary.com/dgshx4n2c/image/upload/v1736416025/My%20Brand/Logo_lnkwkb.png"
                },
                Android = new AndroidConfig
                {
                    Priority = Priority.High
                },
                Apns = new ApnsConfig
                {
                    Aps = new Aps
                    {
                        Alert = new ApsAlert
                        {
                            Title = title,
                            Body = body
                        }
                    }
                },
                Token = token
            };

            var reponse = await FirebaseMessaging.DefaultInstance.SendAsync(message);
            return reponse;

        }

        public static async Task<bool> SendRangeMessageFireBase(string title, string body, List<string> tokens)
        {
            var message = new MulticastMessage()
            {
                Notification = new Notification()
                {
                    Title = title,
                    Body = body,
                    ImageUrl = "https://res.cloudinary.com/dgshx4n2c/image/upload/v1736416025/My%20Brand/Logo_lnkwkb.png"
                },
                Android = new AndroidConfig
                {
                    Priority = Priority.High
                },
                Apns = new ApnsConfig
                {
                    Aps = new Aps
                    {
                        Alert = new ApsAlert
                        {
                            Title = title,
                            Body = body
                        }
                    }
                },
                Tokens = tokens
            };

            var reponse = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message);
            return true;

        }
    }
}
