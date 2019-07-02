export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', name: 'login', component: './User/Login' },
      { path: '/user/register', name: 'register', component: './User/Register' },
      {
        path: '/user/register-result',
        name: 'register.result',
        component: './User/RegisterResult',
      },
      {
        component: '404',
      },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      // dashboard
      { path: '/', redirect: '/form/table-form' },
   
      // forms
      {
        path: '/form',
        icon: 'form',
        name: 'form',
        routes: [
          {
            path: '/form/table-form',
            name: 'basicform',
            component: './Forms/TableForm',
          },
        ],
      },
      // forms
      {
        path: '/order',
        icon: 'form',
        name: 'form',
        routes: [
          {
            path: '/order/order-details',
            name: 'order-details',
            component: './Order/OrderDetails_/OrderDetails',
          },
        ],
      },
      // list
       
      {
        component: '404',
      },
    ],
  },
];
