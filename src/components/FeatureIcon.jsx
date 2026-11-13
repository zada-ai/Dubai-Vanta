import React from 'react';
import {
  RiTruckLine,
  RiShieldCheckLine,
  RiExchangeLine,
  RiCustomerService2Line,
  RiAwardLine,
  RiStarLine,
  RiGiftLine,
  RiHeartLine,
  RiFlashlightLine,
  RiLockPasswordLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';

export const PRESET_ICONS = [
  { id: 'truck', label: 'Truck / Delivery', Icon: RiTruckLine },
  { id: 'shield', label: 'Shield / Security', Icon: RiShieldCheckLine },
  { id: 'exchange', label: 'Exchange / Returns', Icon: RiExchangeLine },
  { id: 'support', label: 'Headset / Support', Icon: RiCustomerService2Line },
  { id: 'award', label: 'Award / Quality', Icon: RiAwardLine },
  { id: 'star', label: 'Star / Top Rated', Icon: RiStarLine },
  { id: 'gift', label: 'Gift / Rewards', Icon: RiGiftLine },
  { id: 'heart', label: 'Heart / Care', Icon: RiHeartLine },
  { id: 'flash', label: 'Flash / Express', Icon: RiFlashlightLine },
  { id: 'lock', label: 'Lock / Privacy', Icon: RiLockPasswordLine },
  { id: 'check', label: 'Verified / Check', Icon: RiCheckboxCircleLine }
];

export const getPresetIconComponent = (presetId) => {
  const found = PRESET_ICONS.find((p) => p.id === presetId);
  return found ? found.Icon : RiTruckLine;
};

const FeatureIcon = ({ feature, className = 'w-5 h-5 sm:w-6 sm:h-6' }) => {
  if (!feature) return null;

  // 1. If raw custom SVG markup is provided
  if (feature.customSvg && feature.customSvg.trim().startsWith('<svg')) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full [&>svg]:currentColor ${className}`}
        dangerouslySetInnerHTML={{ __html: feature.customSvg }}
      />
    );
  }

  // 2. If uploaded image / SVG file URL is provided
  if (feature.customIconUrl) {
    return (
      <img
        src={feature.customIconUrl}
        alt={feature.title || 'Feature icon'}
        className={`${className} object-contain shrink-0`}
      />
    );
  }

  // 3. Fallback to Preset Icon
  const IconComp = getPresetIconComponent(feature.iconPreset);
  return <IconComp className={`${className} shrink-0`} />;
};

export default FeatureIcon;

