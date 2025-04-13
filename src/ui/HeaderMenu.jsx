import { HiOutlineUser, HiCloudArrowUp } from 'react-icons/hi2'
import ButtonIcon from './ButtonIcon'
import Logout from './Logout'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import DarkModeToggle from './DarkModeToggle'

const StyledHeaderMenu = styled.ul`
    display: flex;
    gap: 0.6rem;
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
                <ButtonIcon onClick={() => navigate('/upload')}>
                    <HiCloudArrowUp />
                </ButtonIcon>
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
