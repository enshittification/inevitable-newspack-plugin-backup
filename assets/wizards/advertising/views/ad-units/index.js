/**
 * Ad Unit Management Screens.
 */

/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ExternalLink } from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	ActionCard,
	Button,
	Card,
	Notice,
	SelectControl,
	TextControl,
	withWizardScreen,
} from '../../../../components/src';
import ServiceAccountConnection from './service-account-connection';
import OptionsPopover from './options-popover';

const CREATE_AD_ID_PARAM = 'create';

/**
 * Advertising management screen.
 */
const AdUnits = ( {
	adUnits,
	onDelete,
	wizardApiFetch,
	updateWithAPI,
	service,
	serviceData,
	fetchAdvertisingData,
} ) => {
	const gamErrorMessage = serviceData?.status?.error
		? `${ __( 'Google Ad Manager Error', 'newspack' ) }: ${ serviceData.status.error }`
		: false;

	const updateNetworkCode = async ( value, isGam ) => {
		await wizardApiFetch( {
			path: '/newspack/v1/wizard/advertising/network_code/',
			method: 'POST',
			data: { network_code: value, is_gam: isGam },
			quiet: true,
		} );
		fetchAdvertisingData( true );
	};

	const updateGAMNetworkCode = async value => {
		updateNetworkCode( value, true );
	};

	const [ networkCode, setNetworkCode ] = useState( serviceData.status.network_code );
	const updateLegacyNetworkCode = async () => {
		updateNetworkCode( networkCode, false );
	};

	useEffect( () => {
		setNetworkCode( serviceData.status.network_code );
	}, [ serviceData.status.network_code ] );

	const { can_use_service_account, can_use_oauth, connection_mode } = serviceData.status;
	const isLegacy = 'legacy' === connection_mode;

	return (
		<>
			<Card noBorder>
				<Button isLink href="#/" icon={ arrowLeft }>
					{ __( 'Back to Ad Providers', 'newspack' ) }
				</Button>
			</Card>

			{ ! isLegacy && networkCode && (
				<SelectControl
					label={ __( 'Connected GAM network code', 'newspack' ) }
					value={ networkCode }
					options={ serviceData.available_networks.map( network => ( {
						label: `${ network.name } (${ network.code })`,
						value: network.code,
					} ) ) }
					onChange={ updateGAMNetworkCode }
				/>
			) }
			{ false === serviceData.status?.is_network_code_matched && (
				<Notice
					noticeText={ __(
						'Your GAM network code is different than the network code the site was configured with. Legacy ad units are likely to not load.',
						'newspack'
					) }
					isWarning
				/>
			) }
			{ gamErrorMessage && <Notice noticeText={ gamErrorMessage } isError /> }
			{ serviceData.created_targeting_keys?.length > 0 && (
				<Notice
					noticeText={ [
						__( 'Created custom targeting keys:' ) + '\u00A0',
						serviceData.created_targeting_keys.join( ', ' ) + '. \u00A0',
						<ExternalLink
							href={ `https://admanager.google.com/${ serviceData.network_code }#inventory/custom_targeting/list` }
							key="google-ad-manager-custom-targeting-link"
						>
							{ __( 'Visit your GAM dashboard' ) }
						</ExternalLink>,
					] }
					isSuccess
				/>
			) }
			{ isLegacy && (
				<>
					{ ( can_use_service_account || can_use_oauth ) && (
						<Notice
							noticeText={ __( 'Currently operating in legacy mode.', 'newspack' ) }
							isWarning
						/>
					) }
					<div className="flex items-end">
						<TextControl
							label={ __( 'Network Code', 'newspack' ) }
							value={ networkCode }
							onChange={ setNetworkCode }
							withMargin={ false }
						/>
						<span className="pl3">
							<Button onClick={ updateLegacyNetworkCode } isPrimary>
								{ __( 'Save', 'newspack' ) }
							</Button>
						</span>
					</div>
				</>
			) }
			<p>
				{ __(
					'Set up multiple ad units to use on your homepage, articles and other places throughout your site.',
					'newspack'
				) }
				<br />
				{ __(
					'You can place ads through our Newspack Ad Block in the Editor, Newspack Ad widget, and using the global placements.',
					'newspack'
				) }
			</p>
			<Card headerActions noBorder>
				<div className="flex justify-end w-100">
					<Button isPrimary isSmall href={ `#/google_ad_manager/${ CREATE_AD_ID_PARAM }` }>
						{ __( 'Add New Ad Unit', 'newspack' ) }
					</Button>
				</div>
			</Card>
			<Card noBorder>
				{ Object.values( adUnits )
					.filter( adUnit => adUnit.id !== 0 )
					.sort( ( a, b ) => b.name.localeCompare( a.name ) )
					.sort( a => ( a.is_legacy ? 1 : -1 ) )
					.map( adUnit => {
						const editLink = `#${ service }/${ adUnit.id }`;
						return (
							<ActionCard
								key={ adUnit.id }
								title={ adUnit.name }
								isSmall
								titleLink={ editLink }
								description={ () => (
									<span>
										{ adUnit.is_legacy ? (
											<>
												<i>{ __( 'Legacy ad unit.', 'newspack' ) }</i> |{ ' ' }
											</>
										) : null }
										{ __( 'Sizes:', 'newspack' ) }{ ' ' }
										{ adUnit.sizes.map( ( size, i ) => (
											<code key={ i }>{ size.join( 'x' ) }</code>
										) ) }
										{ adUnit.fluid && <code>{ __( 'Fluid', 'newspack' ) }</code> }
									</span>
								) }
								actionText={
									<OptionsPopover
										deleteLink={ () => onDelete( adUnit.id ) }
										editLink={ editLink }
									/>
								}
							/>
						);
					} ) }
			</Card>
			{ can_use_service_account && connection_mode !== 'oauth' && (
				<ServiceAccountConnection
					updateWithAPI={ updateWithAPI }
					isConnected={ serviceData.status.connected }
				/>
			) }
		</>
	);
};

export default withWizardScreen( AdUnits );
