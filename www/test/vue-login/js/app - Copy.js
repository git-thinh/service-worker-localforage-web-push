const User = {
    template:
        '<div class="user">' +
        '  <h2>User {{ $route.params.id }}</h2>' +
        '  <router-view></router-view>' +
        '</div>'
}

const UserHome = { template: '<div>Home</div>' }
const UserProfile = { template: '<div>Profile</div>' }
const UserPosts = { template: '<div>Posts</div>' }

const router = new VueRouter({
    routes: [
      {
          path: '/user/:id', component: User,
          children: [
            // UserHome will be rendered inside User's <router-view>
            // when /user/:id is matched
            { path: '', component: UserHome },

            // UserProfile will be rendered inside User's <router-view>
            // when /user/:id/profile is matched
            { path: 'profile', component: UserProfile },

            // UserPosts will be rendered inside User's <router-view>
            // when /user/:id/posts is matched
            { path: 'posts', component: UserPosts }
          ]
      }
    ]
})

const app = new Vue({ router }).$mount('#app');


//// literal string path
//router.push('home')

//// object
//router.push({ path: 'home' })

//// named route
//router.push({ name: 'user', params: { userId: 123 } })

//// with query, resulting in /register?plan=private
//router.push({ path: 'register', query: { plan: 'private' } })

//const userId = 123
//router.push({ name: 'user', params: { userId } }) // -> /user/123
//router.push({ path: `/user/${userId}` }) // -> /user/123
//// This will NOT work
//router.push({ path: '/user', params: { userId } }) // -> /user