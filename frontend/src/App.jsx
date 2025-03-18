import ScrollToTop from "react-scroll-to-top";
import { Toaster } from "react-hot-toast";
import { useReactRouter } from "./Components/Hooks/useReactRouter";
import { useAuthContext } from "./Components/Context/AuthContext";

// components
import Footer from "./Components/Custom/Footer/Footer";
import ErrorBoundary from "./Components/Error/ErrorBoundary";
import Nav from "./Components/Custom/Nav/Nav";
import Home from "./Components/App/Home/Home";
import SearchResults from "./Components/App/Search/SearchResults";
import NotFound from "./Components/App/404/NotFound";
import AffiliatePage from "./Components/App/Others/AffiliatePage";
import FAQComponent from "./Components/App/Others/FAQComponent";
import Privacy from "./Components/App/Others/Privacy";
import Pricing from "./Components/App/Others/Pricing";
import ContactUs from "./Components/App/Others/ContactUs";
import CommunityView from "./Components/App/Community/CommunityView";
import Profile from "./Components/App/Profile/Profile";
import CreateCommunity from "./Components/App/Community/CreateCommunity";
import EnterCommunity from "./Components/App/Community/EnterCommunity";
import CreateCourse from "./Components/App/Community/CreateCourse";

function App() {
    const { user } = useAuthContext();

    const { Routes, Route, Navigate } = useReactRouter();

    return (
        <ErrorBoundary>
            <div className="App">
                <div className="app-div">
                    <Nav />

                    {/* routing */}
                    <Routes>
                        {/* home */}
                        <Route path="/" exact element={<Home />} />
                        {/* discovery */}
                        <Route path="/discovery" exact element={<Home />} />

                        {/* search results */}
                        <Route path="/search" element={<SearchResults />} />

                        {/* affiliates */}
                        <Route path="/affiliates" element={<AffiliatePage />} />

                        {/* support */}
                        <Route
                            path="/frequently-asked-questions"
                            element={<FAQComponent />}
                        />

                        {/* privacy */}
                        <Route path="/privacy" element={<Privacy />} />

                        {/* pricing */}
                        <Route path="/pricing" element={<Pricing />} />

                        {/* contact us */}
                        <Route path="/contact-us" element={<ContactUs />} />

                        {/* view a community */}
                        <Route
                            path="/community/:communityId"
                            element={<CommunityView />}
                        />
                        {/* Enter a community */}
                        <Route
                            path="/community/access/:communityId"
                            element={<EnterCommunity />}
                        />
                        {/* Create a community course */}
                        <Route
                            path="/admin/add-course/:communityId"
                            element={<CreateCourse />}
                        />

                        {/* profile */}
                        <Route
                            path="/profile"
                            element={user ? <Profile /> : <Navigate to="/" />}
                        />
                        {/* create a community */}
                        <Route
                            path="/create-a-community"
                            element={
                                user ? <CreateCommunity /> : <Navigate to="/" />
                            }
                        />

                        {/* catch all route */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>

                {/* scroll to top BTN */}
                <ScrollToTop
                    color="black"
                    smooth
                    width="20"
                    height="20"
                    className="scrollToTopBtn"
                />

                {/* footer */}
                <Footer />

                {/* custom components */}
                <Toaster />
            </div>
        </ErrorBoundary>
    );
}

export default App;
