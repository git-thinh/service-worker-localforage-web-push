using System;
using System.Net.Sockets;

namespace tcp.clients
{
    class c1
    {
        static void Main(string[] args)
        {
            TcpClient client = new TcpClient();
            //client.Connect("52.77.82.145", 80);
            client.Connect("127.0.0.1", 55555);

            //var client = new TcpClient("apimobi.f88.vn", 80);
            //var client = new TcpClient("localhost", 9015);
            //var client = new TcpClient("localhost", 3456);

            var message = System.Text.Encoding.UTF8.GetBytes("tiếng việt = " + Guid.NewGuid().ToString());

            //var message = System.Text.Encoding.ASCII.GetBytes(Guid.NewGuid().ToString());

            var stream = client.GetStream();
            stream.Write(message, 0, message.Length); //sends bytes to server

            stream.Close();
            client.Close();

            Console.ReadLine();
        }
    }
}
