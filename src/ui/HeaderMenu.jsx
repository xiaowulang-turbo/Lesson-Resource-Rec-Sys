import { HiOutlineUser, HiCloudArrowUp } from 'react-icons/hi2'
import Button from './Button'
import Logout from './Logout'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import DarkModeToggle from './DarkModeToggle'

const StyledHeaderMenu = styled.ul`
    display: flex;
    align-items: center;
    gap: 1.2rem;
`

export default function HeaderMenu() {
    const navigate = useNavigate()

    return (
        <StyledHeaderMenu>
            {/* <li>
        <ButtonIcon onClick={() => navigate("/account")}>
          <HiOutlineUser />
        </ButtonIcon>
      </li> */}
            <li>
                <Button
                    size="medium"
                    variation="primary"
                    onClick={() => navigate('/upload')}
                >
                    <HiCloudArrowUp />
                    <span style={{ marginLeft: '0.6rem' }}>上传资源</span>
                </Button>
            </li>
            <li>
                <DarkModeToggle />
            </li>
            <li>
                <Logout />
            </li>
        </StyledHeaderMenu>
    )
}
