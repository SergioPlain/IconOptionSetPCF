/* eslint-disable no-unused-vars */
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { IconOptionSetControl, IProps, IIconSetup} from "./IconOptionSet";
import * as React from "react";

export class IconSingleOptionSet implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private _selected: number | undefined;
    
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;
    private _notifyOutputChanged: () => void;

    private _props: IProps = {
        selected: undefined,
        icons: [],
        readonly: false,
        masked: false,
        nullable: false,
        selectedcolor: "",
        onChange: this.notifyChange.bind(this)
    }


    notifyChange(selected: number|undefined) {
		
		this._selected = selected;
		this._notifyOutputChanged();
	}

    /**
     * Empty constructor.
     */
    constructor() { }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param _context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param _state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        _context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary
    ): void {
        this._notifyOutputChanged = notifyOutputChanged;
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param _context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(_context: ComponentFramework.Context<IInputs>): React.ReactElement {
        
        // If the form is disabled because it is inactive or the user doesn't have access
		// isControlDisabled is set to true
		let isReadOnly = _context.mode.isControlDisabled;

		let isMasked = false;
		// When a field has FLS enabled, the security property on the attribute parameter is set
		if (_context.parameters.optionset.security) {
			isReadOnly = isReadOnly || !_context.parameters.optionset.security.editable;
			isMasked =  !_context.parameters.optionset.security.readable
		}

		/*if(_context.parameters.optionset.attributes == null){
			return;
		}*/

		this._selected = _context.parameters.optionset.raw !== null ? _context.parameters.optionset.raw : undefined;

		let options:ComponentFramework.PropertyHelper.OptionMetadata[] 
				= _context.parameters.optionset.attributes!.Options;

		let icons:Array<string> = [_context.parameters.icon1.raw || "",
									_context.parameters.icon2.raw || "",
									_context.parameters.icon3.raw || "",
									_context.parameters.icon4.raw || "",
									_context.parameters.icon5.raw || ""];
		
		//Prepare Props for React Component
		this._props.selected = this._selected;
		this._props.icons = this.getIconSetups(options,icons);
		this._props.selectedcolor = _context.parameters.selectedcolor.raw || "";
		this._props.readonly = isReadOnly;
		this._props.masked = isMasked;
		this._props.nullable = true; //todo add as a parameter in manifest


        return React.createElement(
            IconOptionSetControl, this._props
        );
    }


    private getIconSetups(options:Array<ComponentFramework.PropertyHelper.OptionMetadata>, icons:Array<string>) : Array<IIconSetup>
	{
		return options.map((option,index)=>this.getIconSetup(option,icons[index]));
	}

	private getIconSetup(option:ComponentFramework.PropertyHelper.OptionMetadata, icon:string) : IIconSetup
	{
		return {key:option.Value,icon:icon,text:option.Label};
	}


    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {
			optionset: this._selected
		};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
