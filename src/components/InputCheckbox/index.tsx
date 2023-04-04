import classNames from "classnames"
import { useRef } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)

  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      <label
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
      />
      {/* Bug #2 - set the input to be position: absolute & opacity:0 so that click events still happen 
          and can be properly tabbed to. Include disabled so that progress indicator still shows  */}
      <input
        id={inputId}
        type="checkbox"
        className={classNames("RampInputCheckbox--input", {
          "RampInputCheckbox--label-disabled": disabled,
        })}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(!checked)}
      />
    </div>
  )
}
