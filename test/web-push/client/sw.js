self.addEventListener('push', async event => {

    const data = await event.data.json();

    console.log('SW -> PUSH = ', data);


    self.registration.showNotification(data.title, {
        body: 'Yay it works!'
    });
});
