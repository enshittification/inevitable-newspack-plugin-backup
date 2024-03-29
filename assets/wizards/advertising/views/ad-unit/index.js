/**
 * New/Edit Ad Unit Screen
 */

/**
 * WordPress dependencies.
 */
import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { trash } from '@wordpress/icons';

/**
 * Internal dependencies.
 */
import {
	Button,
	Card,
	Grid,
	Notice,
	TextControl,
	withWizardScreen,
} from '../../../../components/src';
import AdUnitSizeControl, {
	DEFAULT_SIZES as adUnitSizes,
} from '../../components/ad-unit-size-control';

/**
 * New/Edit Ad Unit Screen.
 */
class AdUnit extends Component {
	/**
	 * Handle an update to an ad unit field.
	 *
	 * @param {string|Object} adUnitChangesOrKey Ad Unit field name or object containing changes.
	 * @param {any}           value              New value for field.
	 *
	 */
	handleOnChange( adUnitChangesOrKey, value ) {
		const { adUnit, onChange, service } = this.props;
		const adUnitChanges =
			typeof adUnitChangesOrKey === 'string'
				? { [ adUnitChangesOrKey ]: value }
				: adUnitChangesOrKey;
		onChange( { ...adUnit, ad_service: service, ...adUnitChanges } );
	}

	getSizeOptions() {
		const { adUnit } = this.props;
		const sizes = adUnit.sizes && Array.isArray( adUnit.sizes ) ? adUnit.sizes : [];
		let sizeOptions = [ ...sizes ];
		if ( adUnit.fluid ) {
			sizeOptions = [ ...sizeOptions, 'fluid' ];
		}
		return sizeOptions;
	}

	getNextAvailableSize() {
		return adUnitSizes.find( size => ! this.getSizeOptions().includes( size ) ) || [];
	}

	/**
	 * Render.
	 */
	render() {
		const { adUnit, onSave, service } = this.props;
		const { id, code, fluid = false, name = '' } = adUnit;
		const isLegacy = adUnit.is_legacy;
		const isExistingAdUnit = id !== 0;
		const sizes = adUnit.sizes && Array.isArray( adUnit.sizes ) ? adUnit.sizes : [];
		const isInvalidSize = ! fluid && sizes.length === 0;
		const sizeOptions = this.getSizeOptions();
		return (
			<>
				<Card headerActions noBorder>
					<h2>{ __( 'Ad Unit Details', 'newspack' ) }</h2>
				</Card>

				<Grid gutter={ 32 }>
					<TextControl
						label={ __( 'Name', 'newspack' ) }
						value={ name || '' }
						onChange={ value => this.handleOnChange( 'name', value ) }
					/>
					{ ( isExistingAdUnit || isLegacy ) && (
						<TextControl
							label={ __( 'Code', 'newspack' ) }
							value={ code || '' }
							className="code"
							help={
								isLegacy
									? undefined
									: __(
											"Identifies the ad unit in the associated ad tag. Once you've created the ad unit, you can't change the code.",
											'newspack'
									  )
							}
							disabled={ ! isLegacy }
							onChange={ value => this.handleOnChange( 'code', value ) }
						/>
					) }
				</Grid>

				<Card headerActions noBorder>
					<h2>
						{ sizeOptions.length > 1
							? __( 'Ad Unit Sizes', 'newspack' )
							: __( 'Ad Unit Size', 'newspack' ) }
					</h2>
					<Button
						isSecondary
						isSmall
						onClick={ () =>
							this.handleOnChange( 'sizes', [ ...sizes, this.getNextAvailableSize() ] )
						}
					>
						{ __( 'Add New Size', 'newspack' ) }
					</Button>
				</Card>

				{ isInvalidSize && (
					<Notice
						isWarning
						noticeText={ __(
							'The ad unit must have at least one valid size or fluid size enabled.',
							'newspack'
						) }
					/>
				) }

				<Grid columns={ 4 } gutter={ 8 } className="newspack-grid__thead">
					<strong>{ __( 'Size', 'newspack' ) }</strong>
					<strong>{ __( 'Width', 'newspack' ) }</strong>
					<strong>{ __( 'Height', 'newspack' ) }</strong>
					<span className="screen-reader-text">{ __( 'Action', 'newspack' ) }</span>
				</Grid>

				{ sizeOptions.map( ( size, index ) => (
					<Grid columns={ 4 } gutter={ 8 } className="newspack-grid__tbody" key={ index }>
						<AdUnitSizeControl
							selectedOptions={ sizeOptions }
							value={ size }
							onChange={ value => {
								const adUnitChanges = {};
								const prevValue = sizeOptions[ index ];
								if ( prevValue === 'fluid' ) {
									adUnitChanges.fluid = false;
								}
								if ( value === 'fluid' ) {
									sizes.splice( index, 1 );
									adUnitChanges.fluid = true;
								} else {
									sizes[ index ] = value;
								}
								adUnitChanges.sizes = sizes;
								this.handleOnChange( adUnitChanges );
							} }
						/>
						<Button
							isQuaternary
							onClick={ () => {
								if ( size === 'fluid' ) {
									this.handleOnChange( 'fluid', false );
								} else {
									sizes.splice( index, 1 );
									this.handleOnChange( 'sizes', sizes );
								}
							} }
							icon={ trash }
							disabled={ sizeOptions.length <= 1 }
							label={ __( 'Delete', 'newspack' ) }
							showTooltip={ true }
						/>
					</Grid>
				) ) }

				<div className="newspack-buttons-card">
					<Button
						disabled={ name.length === 0 || ( isLegacy && code.length === 0 ) || isInvalidSize }
						isPrimary
						onClick={ () => onSave( id ) }
					>
						{ __( 'Save', 'newspack' ) }
					</Button>
					<Button isSecondary href={ `#/${ service }` }>
						{ __( 'Cancel', 'newspack' ) }
					</Button>
				</div>
			</>
		);
	}
}

export default withWizardScreen( AdUnit );
