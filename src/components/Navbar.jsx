import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container,
} from '@mui/material'

const Navbar = () => {
    return (
        <AppBar position="static">
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component={RouterLink}
                        to="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        学习资源推荐系统
                    </Typography>
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: { xs: 'none', md: 'flex' },
                        }}
                    >
                        <Button
                            component={RouterLink}
                            to="/"
                            sx={{ my: 2, color: 'white', display: 'block' }}
                        >
                            首页
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/resources"
                            sx={{ my: 2, color: 'white', display: 'block' }}
                        >
                            资源
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/profile"
                            sx={{ my: 2, color: 'white', display: 'block' }}
                        >
                            个人中心
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
}

export default Navbar
