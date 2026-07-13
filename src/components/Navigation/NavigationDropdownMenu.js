import React, {Component} from "react";
import PropTypes from "prop-types";

class Navigation extends Component {
    handleDropdownChange({target}) {
        const items = this.props.list.list;
        if (!items) return;
        let selectedItem;
        if (this.props.list.tango) {
            selectedItem = items.find((item) => item === target.value);
        } else {
            selectedItem = items.find((item) =>
                item[this.props.list.displayKey] === target.value);
        }
        this.props.handleMenuSelect(selectedItem, this.props.list.tango);
    }

    optionsRender() {
        const items = this.props.list.list;
        if (!items) return null;
        if (this.props.list.tango) {
            return items.map((item, i) => (
                <option key={i} value={item}>{item}</option>
            ));
        } else {
            return items.map((item, i) => (
                <option key={i} value={item[this.props.list.displayKey]}>
                    {item[this.props.list.displayKey]}
                </option>
            ));
        }
    }

    render() {
        const {ontology} = this.props.list;
        return (
            <form className="NavigationDropdownMenu">
                <select
                    aria-label={ontology ? `Select ${ontology}` : "Select an option"}
                    value={this.props.list.selectValue}
                    onChange={this.handleDropdownChange.bind(this)}>
                    {this.optionsRender()}
                </select>
            </form>
        );
    }
}

Navigation.propTypes = {
    "handleMenuSelect": PropTypes.func.isRequired,
    "list": PropTypes.shape({
        "displayKey": PropTypes.any,
        "list": PropTypes.any,
        "selectValue": PropTypes.any,
        "tango": PropTypes.any,
    }).isRequired,
};

export default Navigation;
