import HomePage from '../pages/home/home-page.js';
import LoginPage from '../pages/login/login-page.js';
import RegisterPage from '../pages/register/register-page.js';
import AddStoryPage from '../pages/add/add-page.js';
import DetailPage from '../pages/detail/detail-page.js';
import AboutPage from '../pages/about/about-page.js';
import BookmarksPage from '../pages/bookmarks/bookmarks-page.js';

const routes = {
  '/': new HomePage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/add': new AddStoryPage(),
  '/stories/:id': new DetailPage(),
  '/about': new AboutPage(),
  '/bookmarks': new BookmarksPage(),
};

export default routes;
