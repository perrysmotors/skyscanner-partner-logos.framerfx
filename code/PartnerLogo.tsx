import * as React from "react"
import { Frame, addPropertyControls, ControlType } from "framer"

import { assets } from "./Assets"

function getLogos(type) {
    return assets
        .filter((asset) => asset.owner.startsWith(type))
        .sort((a, b) => (a.name > b.name ? 1 : -1))
}

function getOptions(logos) {
    const IDs = logos.map((asset) => asset.id)
    const titles = logos.map((asset) => asset.name.trim())
    return [IDs, titles]
}

const airlines = getLogos("Airline")
const otas = getLogos("OTA")
const hotels = getLogos("Hotel")
const chargeCards = getLogos("Payment")
// const railways = getLogos("Rail")

const [airlineIDs, airlineTitles] = getOptions(airlines)
const [otaIDs, otaTitles] = getOptions(otas)
const [hotelIDs, hotelTitles] = getOptions(hotels)
const [chargeCardIDs, chargeCardTitles] = getOptions(chargeCards)

const baseURL = "https://gateway.skyscanner.net/brand-assets/v2/assets/"
const placeholder = "https://static.framer.com/placeholder.png"
// Use Virgin America as default logo
const defaultAssetID = "0c981a80-89de-11e8-bf8d-cf6959597582"
const defaultAssetURL =
    "https://content.skyscnr.com/31e840b1de551df383d816b953b1a568/ai-template-virgin-america-full-1.svg"

export function PartnerLogo(props) {
    const {
        id,
        category,
        airlineID,
        otaID,
        hotelID,
        chargeCardID,
        assetVariantIndex,
        isThumb,
        hasFill,
        radius,
        ...rest
    } = props

    let assetID
    if (category === "OTA") {
        assetID = otaID
    } else if (category === "Hotel") {
        assetID = hotelID
    } else if (category === "Payment") {
        assetID = chargeCardID
    } else {
        assetID = airlineID
    }

    const key = `partnerLogos_${
        id.includes("id_") ? id.substring(3, id.length) : id
    }`

    const cache = localStorage.getItem(key)
        ? JSON.parse(localStorage.getItem(key))
        : {}

    const [logoColour, setLogoColour] = React.useState(
        cache.logoColourURL || defaultAssetURL
    )
    const [logoWhite, setLogoWhite] = React.useState(
        cache.logoWhiteURL || defaultAssetURL
    )
    const [thumbColour, setThumbColour] = React.useState(
        cache.thumbColourURL || defaultAssetURL
    )
    const [thumbWhite, setThumbWhite] = React.useState(
        cache.thumbWhiteURL || defaultAssetURL
    )
    const [backgroundColor, setBackgroundColor] = React.useState(
        cache.backgroundColor || "transparent"
    )

    async function getAndSetContent(assetID) {
        try {
            const url = `${baseURL}${assetID}`
            const response = await fetch(url)
            const json = await response.json()
            const content = await json[assetID].content

            const logoColourURL = content["logos"][0]?.svg || placeholder
            const logoWhiteURL = content["logos"][1]?.svg || placeholder
            const thumbColourURL = content["thumbnails"][0]?.svg || placeholder
            const thumbWhiteURL = content["thumbnails"][1]?.svg || placeholder
            const backgroundColor =
                content.colors[0]?.background?.hex || "transparent"

            localStorage.setItem(
                key,
                JSON.stringify({
                    assetID: assetID,
                    logoColourURL: logoColourURL,
                    logoWhiteURL: logoWhiteURL,
                    thumbColourURL: thumbColourURL,
                    thumbWhiteURL: thumbWhiteURL,
                    backgroundColor: backgroundColor,
                })
            )

            setLogoColour(logoColourURL)
            setLogoWhite(logoWhiteURL)
            setThumbColour(thumbColourURL)
            setThumbWhite(thumbWhiteURL)
            setBackgroundColor(backgroundColor)
        } catch (err) {
            console.log(err)
        }
    }

    React.useEffect(() => {
        if (assetID !== cache.assetID) getAndSetContent(assetID)
    }, [assetID])

    const logoVersion = () => {
        if (assetVariantIndex === 0) {
            return isThumb ? thumbColour : logoColour
        } else {
            return isThumb ? thumbWhite : logoWhite
        }
    }

    return (
        <Frame
            {...rest}
            radius={radius}
            backgroundColor={hasFill ? backgroundColor : "transparent"}
            image={logoVersion()}
            style={{
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
            }}
        />
    )
}

PartnerLogo.defaultProps = {
    height: 90,
    width: 180,
}

addPropertyControls(PartnerLogo, {
    category: {
        type: ControlType.Enum,
        title: "Category",
        defaultValue: "Airline",
        options: ["Airline", "OTA", "Hotel", "Payment"],
    },
    airlineID: {
        title: "Logo",
        type: ControlType.Enum,
        defaultValue: defaultAssetID,
        options: airlineIDs,
        optionTitles: airlineTitles,
        hidden: ({ category }) => category !== "Airline",
    },
    otaID: {
        title: "Logo",
        type: ControlType.Enum,
        options: otaIDs,
        optionTitles: otaTitles,
        hidden: ({ category }) => category !== "OTA",
    },
    hotelID: {
        title: "Logo",
        type: ControlType.Enum,
        options: hotelIDs,
        optionTitles: hotelTitles,
        hidden: ({ category }) => category !== "Hotel",
    },
    chargeCardID: {
        title: "Logo",
        type: ControlType.Enum,
        options: chargeCardIDs,
        optionTitles: chargeCardTitles,
        hidden: ({ category }) => category !== "Payment",
    },
    assetVariantIndex: {
        type: ControlType.Enum,
        title: "Version",
        defaultValue: 0,
        options: [0, 1],
        optionTitles: ["Colour", "White"],
        displaySegmentedControl: true,
    },
    isThumb: {
        type: ControlType.Boolean,
        title: "Format",
        defaultValue: false,
        enabledTitle: "Thumbnail",
        disabledTitle: "Default",
    },
    hasFill: {
        type: ControlType.Boolean,
        title: "Background",
        defaultValue: false,
        enabledTitle: "Colour",
        disabledTitle: "None",
        // hidden: ({ assetVariantIndex }) => assetVariantIndex === 0,
    },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 0,
        min: 0,
        displayStepper: true,
    },
})

PartnerLogo.displayName = "Partner Logo"
