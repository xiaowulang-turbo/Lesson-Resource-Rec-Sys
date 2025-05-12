import styled from 'styled-components'
import PropTypes from 'prop-types'

const StyledCheckbox = styled.div`
    display: inline-block;
    position: relative;
`

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
`

const CheckboxControl = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: ${(props) =>
        props.checked ? 'var(--color-brand-600)' : 'var(--color-grey-200)'};
    border-radius: 4px;
    transition: all 150ms;

    &:hover {
        border: 1px solid var(--color-brand-500);
    }

    ${HiddenCheckbox}:focus + & {
        box-shadow: 0 0 0 3px var(--color-brand-100);
    }

    ${(props) =>
        props.checked &&
        `
    &:after {
      content: '';
      width: 10px;
      height: 10px;
      background: white;
      border-radius: 2px;
    }
  `}
`

Checkbox.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
}

function Checkbox({ className, checked, onChange, ...props }) {
    return (
        <StyledCheckbox className={className}>
            <HiddenCheckbox checked={checked} onChange={onChange} {...props} />
            <CheckboxControl checked={checked} />
        </StyledCheckbox>
    )
}

export default Checkbox
