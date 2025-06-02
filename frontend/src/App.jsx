import ScrollToTop from "react-scroll-to-top";
import { Toaster } from "react-hot-toast";
import { useReactRouter } from "./Components/Hooks/useReactRouter";
import { useAuthContext } from "./Components/Context/AuthContext";

// components
import Footer from "./Components/Custom/Footer/Footer";
import ErrorBoundary from "./Components/Error/ErrorBoundary";
import Nav from "./Components/Custom/Nav/Nav";
import Home from "./Components/App/Home/Home";
import NotFound from "./Components/App/404/NotFound";
import FAQComponent from "./Components/App/Others/FAQComponent";
import Privacy from "./Components/App/Others/Privacy";
import ContactUs from "./Components/App/Others/ContactUs";
import CommunityView from "./Components/App/Community/CommunityView";
import Profile from "./Components/App/Profile/Profile";
import CreateCommunity from "./Components/App/Community/CreateCommunity";
import EnterCommunity from "./Components/App/Community/EnterCommunity";
import CreateCourse from "./Components/App/Community/CreateCourse";
import Classroom from "./Components/App/Community/Classroom";
import BuggyComponent from "./Components/Error/Bug";
import DashboardHome from "./Components/App/admin/DashboardHome";
import Users from "./Components/App/admin/Users";
import Category from "./Components/App/admin/Category";
import CommunityDash from "./Components/App/admin/CommunityDash";
import UserDetails from "./Components/App/admin/SingleUserDetails";
import Notifications from "./Components/App/notifications/Notifications";
import SingleCommunityDash from "./Components/App/admin/SingleCommunityDash";
import CommunityLayout from "./layout/CommunityLayout";
import Withdrawals from "./Components/App/Profile/Withdrawals";
import WithdrawalsDash from "./Components/App/admin/WithdrawalsDash";
import AdminLayout from "./layout/AdminLayout";
import CommunityCreatorLayout from "./layout/CommunityCreatorLayout";
import PasswordReset from "./Components/App/auth/PasswordReset";
import Settings from "./Components/App/admin/Settings";
import Communities from "./Components/App/Community/Communities";
import AboutUs from "./Components/App/Others/AboutUs";
import SignUp from "./Components/App/auth/SignUp";

function App() {
    const { user } = useAuthContext();

    const { Routes, Route, Navigate, useLocation } = useReactRouter();

    const location = useLocation();

    const showNavFooter = !location.pathname.startsWith("/admin");

    return (
        <ErrorBoundary>
            <div className="App">
                <div className="app-div">
                    {showNavFooter && <Nav />}

                    {/* routing */}
                    <Routes>
                        {/* home */}
                        <Route path="/" exact element={<Home />} />
                        {/* discovery */}
                        <Route
                            path="/communities"
                            exact
                            element={<Communities />}
                        />

                        {/* support */}
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route
                            path="/frequently-asked-questions"
                            element={<FAQComponent />}
                        />

                        {/* privacy */}
                        <Route path="/privacy" element={<Privacy />} />

                        {/* contact us */}
                        <Route path="/contact-us" element={<ContactUs />} />

                        {/* auth / password reset */}
                        <Route
                            path="/sign-up"
                            element={
                                !user ? <SignUp /> : <Navigate to="/profile" />
                            }
                        />
                        <Route
                            path="/forgot-password"
                            element={
                                !user ? (
                                    <PasswordReset />
                                ) : (
                                    <Navigate to="/profile" />
                                )
                            }
                        />

                        {/* profile */}
                        <Route
                            path="/profile"
                            element={user ? <Profile /> : <Navigate to="/" />}
                        />

                        {/* withdrawals */}
                        <Route
                            path="/withdrawals"
                            element={
                                user ? <Withdrawals /> : <Navigate to="/" />
                            }
                        />

                        {/* notifications */}
                        <Route
                            path="/notifications"
                            element={
                                user ? <Notifications /> : <Navigate to="/" />
                            }
                        />

                        {/* create a community */}
                        <Route
                            path="/create-a-community"
                            element={
                                user ? <CreateCommunity /> : <Navigate to="/" />
                            }
                        />

                        {/* view a community */}
                        <Route
                            path="/community/:communityId"
                            element={<CommunityView />}
                        />

                        {/* community membership protected layout */}
                        <Route
                            path="/community/access/:communityId"
                            element={
                                user ? <CommunityLayout /> : <Navigate to="/" />
                            }>
                            <Route index element={<EnterCommunity />} />
                            {/* community course classroom */}
                            <Route
                                path="course/:courseId"
                                element={<Classroom />}
                            />
                        </Route>

                        {/* community creator/owner protected layout */}
                        <Route
                            path="/creator/:communityId"
                            element={
                                user ? (
                                    <CommunityCreatorLayout />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }>
                            {/* Create a community course */}
                            <Route
                                path="add-course"
                                element={<CreateCourse />}
                            />
                        </Route>

                        {/* admin protected layout */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                user ? <AdminLayout /> : <Navigate to="/" />
                            }>
                            <Route index element={<DashboardHome />} />
                            <Route path="users" element={<Users />} />
                            <Route
                                path="user/:userId"
                                element={<UserDetails />}
                            />
                            <Route
                                path="communities"
                                element={<CommunityDash />}
                            />
                            <Route
                                path="community/:communityId"
                                element={<SingleCommunityDash />}
                            />
                            <Route path="categories" element={<Category />} />
                            <Route
                                path="withdrawals"
                                element={<WithdrawalsDash />}
                            />
                            <Route path="settings" element={<Settings />} />
                        </Route>

                        <Route path="/buggy" element={<BuggyComponent />} />

                        {/* catch all route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>

                {/* scroll to top BTN */}
                <ScrollToTop
                    color="blue"
                    smooth
                    width="20"
                    height="20"
                    className="scrollToTopBtn"
                />

                {/* footer */}
                {showNavFooter && <Footer />}

                {/* custom components */}
                <Toaster />
            </div>
        </ErrorBoundary>
    );
}

export default App;
