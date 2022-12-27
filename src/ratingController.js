const fetch = require('node-fetch')

const requestParams = {
    headers: {
        Accept: 'application/json',
        'x-api-version': '2',
    },
};
module.exports = {
    getAuthorities: async function (req, res) {
        let authoritiesResponse = null;

        try {
            authoritiesResponse = await fetch('http://api.ratings.food.gov.uk/Authorities', requestParams);
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: 'Unable to access FSA API' });
        }

        const authoritiesParsed = await authoritiesResponse.json();

        const response = authoritiesParsed.authorities.map(json => {
            return {
                id: json.LocalAuthorityId,
                name: json.Name
            }
        }, authoritiesParsed);

        return res.json(response);
    },

    getAuthority: async function (req, res) {
        const { authorityId } = req.params;

        if (isNaN(authorityId)) {
            return res.status(400).json({ error: 'No valid authority ID was specified' });
        }

        let authoritiesResponse = null;

        try {
            authoritiesResponse = await fetch(`http://api.ratings.food.gov.uk/Authorities/${authorityId}`, requestParams);
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: 'Unable to access FSA API' });
        }

        const authoritiesParsed = await authoritiesResponse.json();
        let authorityResponse = null;

        let jsonFileName = authoritiesParsed.FileName.replace("xml", "json");

        try {
            authorityResponse = await fetch(jsonFileName)
                .then(response => response.text())
                .then(response => response.trim())
                .then(response => JSON.parse(response))
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: 'Unable to access FSA API' });
        }

        let oneStar = twoStar = threeStar = fourStar = fiveStar = exempt = Pass_and_Eat_Safe = Pass = Needs_Improvement = total = 0;
        authorityResponse.FHRSEstablishment.EstablishmentCollection.forEach(element => {
            switch (element.RatingValue) {
                case "1":
                    ++oneStar;
                    break;
                case "2":
                    ++twoStar;
                    break;
                case "3":
                    ++threeStar;
                    break;
                case "4":
                    ++fourStar;
                    break;
                case "5":
                    ++fiveStar;
                    break;
                case "Exempt":
                    ++exempt;
                    break;
                case "Pass and Eat Safe":
                    ++Pass_and_Eat_Safe;
                    break;
                case "Pass":
                    ++Pass;
                    break;
                case "Needs Improvement":
                    ++Needs_Improvement;
                    break;
                default:
                    break;
            }
        });
        if (Pass_and_Eat_Safe > 1) {
            total = Pass_and_Eat_Safe + Pass + Needs_Improvement;
            const FHIS = [
                { name: 'Pass and Eat Safe', value: this.getPercentage(Pass_and_Eat_Safe, total) },
                { name: 'Pass', value: this.getPercentage(Pass, total) },
                { name: 'Needs Improvement	', value: this.getPercentage(Needs_Improvement, total) },
            ];
            return res.json(FHIS);
        } else {
            total = oneStar + twoStar + threeStar + fourStar + fiveStar + exempt;
            const FHRS = [
                { name: '5-star', value: this.getPercentage(fiveStar, total) },
                { name: '4-star', value: this.getPercentage(fourStar, total) },
                { name: '3-star', value: this.getPercentage(threeStar, total) },
                { name: '2-star', value: this.getPercentage(twoStar, total) },
                { name: '1-star', value: this.getPercentage(oneStar, total) },
                { name: 'Exempt', value: this.getPercentage(exempt, total) },
            ];
            return res.json(FHRS);
        }
    },

    getPercentage: function (rating, totalRating) {
        return rating * 100 / totalRating;
    }
};
