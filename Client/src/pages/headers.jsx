import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileImage from "../assets/images/profile.png"
import { useState, useEffect } from 'react';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Chat from '../components/Chat/Chat';
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem
} from "@nextui-org/react";
import Button from '@mui/material/Button';
    
export default function Header() {
    const [count, setCount] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const navigate = useNavigate();

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "http://localhost:5173/signup";
    }

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
        if (!isChatOpen) {
            setUnreadMessages(0);
        }
    };

    const handleChatClick = () => {
        navigate('/chat');
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem onClick={toggleChat}>
                <IconButton size="large" aria-label="show messages" color="inherit">
                    <Badge badgeContent={unreadMessages} color="error">
                        <MailIcon />
                    </Badge>
                </IconButton>
                <p>Quick Chat</p>
            </MenuItem>
            <MenuItem onClick={handleChatClick}>
                <IconButton size="large" aria-label="full screen chat" color="inherit">
                    <Badge badgeContent={0} color="error">
                        <MailIcon />
                    </Badge>
                </IconButton>
                <p>Full Chat</p>
            </MenuItem>
            <MenuItem>
                <IconButton
                    size="large"
                    aria-label="show 17 new notifications"
                    color="inherit"
                >
                    <Badge badgeContent={17} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <p>Notifications</p>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuOpen}>
                <img src={ProfileImage} width="50px" height="50px" alt="profile" />
                <p>Profile</p>
            </MenuItem>
        </Menu>
    );

    useEffect(() => {
        const getToken = async () => {
            const token = localStorage.getItem('token')
            if (token !== null) {
                setCount(true);
            }
        }
        getToken();
        // window.addEventListener('storage', getToken)
    }, []);

    return (
        <Box sx={{ flexGrow: 1, paddingBottom: '6rem' }}>
            <AppBar position="fixed" sx={{
                padding: ".5rem 0",
                backgroundColor: "black",
            }}>
                <Toolbar>
                    <Link to="/">
                        <Typography
                            variant="h5"
                            noWrap
                            component="div"
                            sx={{ display: { xs: 'none', sm: 'block', fontWeight: "bold", color: "#f94566", } }}
                        >
                            TravelSphere
                        </Typography>
                    </Link>
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: '4rem' }}>
                        <Link to={count ? "/feeds" : "/signup"} >
                            <Typography
                                component="div"
                                variant='body1'
                                fontWeight={500}
                            >
                                Feeds
                            </Typography>
                        </Link>
                        <Link to={count ? "/flights" : "/signup"}>
                            <Typography
                                component="div"
                                variant='body1'
                                fontWeight={500}
                            >
                                Flights
                            </Typography>
                        </Link>
                        <Link to={count ? "/about-us" : "/signup"}>
                            <Typography
                                component="div"
                                variant='body1'
                                fontWeight={500}
                            >
                                About Us
                            </Typography>
                        </Link>
                        <Link to={"/contact-us"}>
                            <Typography
                                component="div"
                                variant='body1'
                                fontWeight={500}
                            >
                                Contact Us
                            </Typography>
                        </Link>
                        <Dropdown>
                            <DropdownTrigger>
                                <Typography
                                    component="div"
                                    variant='body1'
                                    fontWeight={500}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    Agency
                                </Typography>
                            </DropdownTrigger>
                            <DropdownMenu aria-label='agency menu'>
                                <DropdownItem key="agency-home">
                                    <Link to={count ? "/agency" : "/signup"}>
                                        Agency Home
                                    </Link>
                                </DropdownItem>
                                <DropdownItem key="agency-login">
                                    <Link to={count ? "/agency/login" : "/signup"}>
                                        Agency Login
                                    </Link>
                                </DropdownItem>
                                <DropdownItem key="agency-signup">
                                    <Link to={count ? "/agency/signup" : "/signup"}>
                                        Agency Signup
                                    </Link>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </Box>
                    {count ? (
                        <>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <IconButton
                                            size="large"
                                            color="inherit"
                                            sx={{ marginRight: 1 }}
                                        >
                                            <Badge badgeContent={unreadMessages} color="error">
                                                <MailIcon />
                                            </Badge>
                                        </IconButton>
                                    </DropdownTrigger>
                                    <DropdownMenu aria-label="Chat options">
                                        <DropdownItem key="popup-chat" onClick={toggleChat}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <MailIcon fontSize="small" />
                                                Quick Chat
                                            </Box>
                                        </DropdownItem>
                                        <DropdownItem key="full-chat" onClick={handleChatClick}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <MailIcon fontSize="small" />
                                                Full Chat
                                            </Box>
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </Box>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Box
                                        sx={{
                                            display: {
                                                xs: 'none',
                                                md: 'flex'
                                            },
                                            alignItems: "center",
                                            gap: "12px",
                                            justifyContent: "center",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <img src={ProfileImage} width="35px" height="35px" style={{ border: '1px solid white', borderRadius: '50%' }}></img>
                                    </Box>
                                </DropdownTrigger>
                                <DropdownMenu aria-label='sections page'>
                                    <DropdownItem key="new" >
                                        <Link to="/profile">                                    
                                            Profile
                                        </Link>
                                    </DropdownItem>
                                    <DropdownItem as={Link} to="/admin" key="123" >
                                        Admin
                                    </DropdownItem>
                                    <DropdownItem as={Link} to="/agency/signup" key="agency-signup">
                                        Create Agency
                                    </DropdownItem>
                                    <DropdownItem onClick={handleLogout} color='danger' key="logout">Logout</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </>
                    ) : (
                        <Link to="/signup">
                            <Box
                                sx={{
                                    display: {
                                        xs: 'none',
                                        md: 'flex'
                                    },
                                    alignItems: "center",
                                    gap: "12px",
                                    justifyContent: "center",
                                    cursor: "pointer"
                                }}
                            >
                                <LockOpenIcon />
                                <Typography
                                    component="div"
                                    variant='body1'
                                    fontWeight={500}
                                >
                                    SignIn/SignUp
                                </Typography>
                            </Box>
                        </Link>
                    )}
                </Toolbar>
            </AppBar>
            {renderMobileMenu}
            {renderMenu}
            <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </Box>
    );
}