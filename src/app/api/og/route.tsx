import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createApi } from "unsplash-js";
import { aiResponseSchema } from "@/lib/schema";
import { Redis } from "@upstash/redis";
import { waitUntil } from "@vercel/functions";

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

const size = {
  width: 1010,
  height: 730,
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  generationConfig: { responseMimeType: "application/json" },
});
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

const getCachedOrFetchUnsplashImage = async (
  query: string
): Promise<string | null> => {
  const cacheKey = `unsplash:${query}`;
  const cachedResult = await redis.get(cacheKey);

  if (cachedResult) {
    return cachedResult as string;
  }

  try {
    const response = await unsplash.search.getPhotos({
      query,
      perPage: 1,
    });
    if (response.errors) return null;
    if (response.response.results.length === 0) return null;
    const imageUrl = response.response.results[0].urls.thumb;

    await redis.set(cacheKey, imageUrl);

    return imageUrl;
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    return null;
  }
};

async function getCachedOrFetchResult(
  query: string
): Promise<{ type: string; output: string }> {
  const cacheKey = `meme:${query}`;
  const cachedResult = await redis.get(cacheKey);

  if (cachedResult) {
    try {
      return JSON.parse(JSON.stringify(cachedResult as string));
    } catch (error) {
      console.error("Error parsing cached result:", error);
    }
  }

  const prompt = generatePrompt(query);
  const result = (await model.generateContent(prompt, {})).response.text();

  try {
    const parsedResult = JSON.parse(result);
    const validatedResult = aiResponseSchema.parse(parsedResult);

    await redis.set(cacheKey, JSON.stringify(validatedResult));

    return validatedResult;
  } catch (error) {
    console.error("Error parsing or validating API result:", error);
    throw new Error("Invalid response from AI model");
  }
}

const logRequest = async () => {
  return redis.incr("total_requests");
};

const logIpData = async (ip: string, ref: string, query: string, type: string, output: string) => {
  return redis.rpush(`ip:${ip}`, JSON.stringify({
    ref: ref || "",
    query,
    type,
    output,
  }));
};

export const runtime = "edge";
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query");
    const ref = request.nextUrl.searchParams.get("ref");
    const ip = request.ip;
    if (!query)
      return fetch(new URL("../../../../public/og.png", import.meta.url));

    const [font, { type, output }] = await Promise.all([
      fetch(
        new URL("../../../../assets/fonts/impact.ttf", import.meta.url)
      ).then((res) => res.arrayBuffer()),
      getCachedOrFetchResult(query),
    ]);

    const sentence = `Yeh lo tumhare liye ${query} leke aya hu`;
    waitUntil(Promise.all([
      logRequest(),
      ip ? logIpData(ip, ref || "", query, type, output) : Promise.resolve()
    ]));

    let imageUrl: string | null = null;
    if (type === "image") {
      imageUrl = output;
    } else if (type === "outsource") {
      imageUrl = await getCachedOrFetchUnsplashImage(output);
    } else if (type === "direct_image") {
      imageUrl = output;
      return fetch(imageUrl);
    }

    const outputElement = imageUrl ? (
      <img src={imageUrl} alt={output} width="100%" height="100%" />
    ) : (
      output
    );

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "#fff",
            fontSize: 60,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
            }}
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100%"
              height="100%"
              viewBox="0 0 1008 720"
              enable-background="new 0 0 1008 720"
            >
              <path
                fill="#000000"
                opacity="1.000000"
                stroke="none"
                d="
M557.468628,721.000000 
	C556.935730,699.004761 556.864258,677.009583 556.811523,655.014343 
	C556.795532,648.364014 556.715393,647.952576 550.228271,649.428955 
	C538.609558,652.073425 527.029419,654.966431 515.588013,658.288757 
	C503.968231,661.662842 492.065674,663.641113 480.304993,666.307007 
	C468.853912,668.902893 457.358856,671.304199 445.902740,673.878479 
	C436.886627,675.904480 427.910950,678.110291 418.898041,680.151123 
	C409.542938,682.269409 400.210602,684.533264 390.866882,686.626587 
	C379.056061,689.272766 367.359070,692.326843 355.699066,695.469360 
	C345.490112,698.220886 335.194672,700.885620 325.576447,705.585876 
	C321.308258,707.671631 316.726959,709.263428 312.235291,710.749451 
	C304.413116,713.337219 293.285645,705.999146 291.571503,697.833069 
	C289.043854,685.791321 293.938171,678.497559 305.971313,673.794189 
	C314.043152,670.639282 322.487122,670.675476 330.706299,669.085266 
	C342.557465,666.792358 354.281677,663.976624 366.069611,661.444519 
	C384.473846,657.491028 402.665253,652.607300 420.996918,648.316040 
	C438.203278,644.288208 455.056396,638.757263 472.079620,633.939514 
	C484.818542,630.334290 497.607178,627.004089 510.627747,624.443542 
	C521.310608,622.342834 531.745728,618.991699 542.306458,616.255920 
	C545.828247,615.343628 549.376831,614.497925 552.954041,613.846619 
	C556.222046,613.251648 557.774841,611.821045 557.733398,608.188538 
	C557.560486,593.023804 558.071960,577.841125 557.531677,562.693604 
	C556.980713,547.244568 556.570068,531.771301 555.575073,516.357056 
	C554.932861,506.407806 555.157837,496.381866 553.898926,486.528229 
	C552.692810,477.087646 552.969055,467.660400 552.323120,458.255829 
	C551.993713,453.459198 549.995117,448.709747 549.553589,443.781830 
	C549.152832,439.308411 549.289429,434.849854 550.450928,430.739532 
	C549.465149,428.974243 548.050476,429.044769 546.760193,429.247131 
	C535.753479,430.973450 524.639343,431.992157 513.567810,431.105682 
	C504.243958,430.359100 494.954041,430.418060 485.645386,430.364624 
	C471.576874,430.283813 457.507446,430.376282 443.438629,430.327515 
	C434.736542,430.297363 426.834869,421.897949 426.674805,412.640289 
	C426.514282,403.355713 434.294250,394.861633 443.233948,394.852142 
	C461.231873,394.833038 479.236298,394.707458 497.225037,395.152039 
	C504.955109,395.343079 512.657471,396.807922 520.363831,397.762817 
	C528.388367,398.757172 536.345642,397.111267 544.139526,396.112183 
	C550.502014,395.296539 557.032410,394.480988 563.345886,394.018433 
	C573.802429,393.252380 583.638184,389.492981 594.072937,389.071106 
	C602.988342,388.710663 611.673462,386.594238 620.452271,385.156067 
	C636.094421,382.593506 650.933838,377.472321 665.475647,371.497070 
	C681.597717,364.872498 697.507935,357.732605 711.049133,346.346680 
	C716.407593,341.841003 721.312012,336.893311 726.002930,331.715210 
	C731.608398,325.527679 730.742188,317.027435 733.781250,310.016449 
	C737.938232,300.426331 732.312256,295.393066 726.121277,290.434540 
	C711.563660,278.774963 695.230774,270.706146 677.097839,266.064148 
	C664.144531,262.748108 651.048828,261.792023 637.758057,260.975647 
	C615.431152,259.604248 593.131653,260.257080 570.830566,260.362976 
	C547.233398,260.475006 523.679932,262.456848 500.099762,263.417053 
	C490.653595,263.801727 481.183655,263.850281 471.737244,264.333740 
	C441.130463,265.900085 410.428101,264.136505 379.872223,266.461731 
	C360.213684,267.957703 340.883026,271.856232 322.454803,279.423706 
	C310.774475,284.220184 299.538910,289.790894 288.910278,296.618469 
	C284.396362,299.518127 281.779510,302.923004 282.176819,308.805756 
	C283.188538,323.784760 282.433563,338.848846 280.076294,353.585876 
	C277.366516,370.526703 278.490814,387.630829 276.351044,404.493256 
	C274.292572,420.714905 273.874878,437.036896 272.156952,453.264587 
	C271.737427,457.227234 271.624359,461.240356 271.646790,465.228729 
	C271.763611,486.014771 268.809387,506.770996 270.417511,527.537415 
	C271.723877,544.406799 271.603027,561.448730 273.810394,578.118225 
	C275.695221,592.351807 275.772644,606.720215 278.210175,620.853882 
	C278.434357,622.153931 278.362885,623.515625 278.335693,624.846802 
	C277.999725,641.285522 280.877533,657.483093 281.968140,673.812805 
	C282.631866,683.750916 282.935089,693.713257 283.382874,703.665588 
	C283.629547,709.148621 283.840240,714.633301 284.033569,720.558594 
	C274.645782,721.000000 265.291534,721.000000 255.468658,721.000000 
	C255.462692,714.237488 256.104187,707.641724 254.119324,700.783447 
	C252.442123,694.988098 253.267532,688.568848 252.934082,682.445557 
	C252.229935,669.515259 251.208542,656.574585 250.150879,643.706299 
	C249.264725,632.924744 247.518509,622.084900 246.388412,611.260620 
	C245.271179,600.559875 243.359360,589.938965 243.218735,579.109253 
	C243.166870,575.115173 242.153992,570.968140 241.304001,567.056580 
	C240.329742,562.573303 240.332306,558.181519 240.024109,553.734802 
	C237.915344,523.309937 238.492203,492.836975 238.806641,462.388336 
	C238.948181,448.683472 239.794647,434.835541 242.131836,421.366699 
	C243.313797,414.555206 243.732590,407.885254 243.494278,401.235931 
	C242.914154,385.050598 245.012802,369.032257 245.941864,352.961182 
	C246.402893,344.986298 246.617584,337.029968 246.706696,329.065430 
	C246.836823,317.436493 248.188950,305.877258 247.655914,294.176178 
	C247.321960,286.845459 251.836304,280.653290 257.717133,276.138916 
	C268.466003,267.887604 280.840454,262.492706 292.974243,256.717743 
	C305.975128,250.530090 319.730408,246.425613 333.422424,242.107895 
	C339.788208,240.100433 346.345306,239.163864 352.807922,237.873505 
	C369.447235,234.551208 386.505737,235.591232 403.256317,234.100220 
	C429.659760,231.749985 456.063049,234.075790 482.357758,231.928314 
	C504.239777,230.141220 526.228149,230.583221 548.043762,228.806183 
	C569.691528,227.042816 591.296997,227.368042 612.847900,227.989456 
	C630.690491,228.503922 648.750610,227.980316 666.392456,231.028503 
	C677.032471,232.866913 687.629883,235.452759 697.967712,239.201599 
	C715.231018,245.461792 731.501465,253.426590 746.406616,264.046082 
	C754.117920,269.540192 761.396851,275.734009 766.049072,284.275269 
	C771.236023,293.798401 772.445251,303.747040 769.028320,314.207336 
	C766.982727,320.469604 766.850647,327.177521 764.249756,333.388489 
	C758.634277,346.798706 749.108948,357.146973 738.543518,366.558655 
	C728.983765,375.074493 718.557922,382.586578 707.127625,388.455811 
	C689.136353,397.694000 670.492004,405.329376 651.236389,411.648804 
	C641.930420,414.702881 632.500549,417.153259 623.070740,419.618286 
	C617.669373,421.030212 611.962830,421.360321 606.368408,421.928101 
	C598.326172,422.744232 590.260925,423.333130 582.345947,424.007050 
	C581.717957,426.318665 582.524353,427.675659 583.400452,429.148254 
	C586.854858,434.954620 586.879578,441.103180 584.915955,447.389526 
	C584.767700,447.864227 584.436584,448.359100 584.490906,448.808289 
	C585.400757,456.333801 581.263733,463.678192 582.587891,470.852722 
	C584.968323,483.750458 582.960388,496.755585 584.658813,509.472870 
	C585.947754,519.124084 585.910767,528.682190 586.080811,538.279968 
	C586.160950,542.802063 587.797180,543.717896 591.977966,543.887756 
	C631.625671,545.498779 671.286804,544.236084 710.937561,544.670776 
	C717.661316,544.744446 722.843750,547.576050 725.744934,553.824463 
	C728.677063,560.139587 727.979858,566.175293 723.617310,571.603088 
	C720.129333,575.942810 715.388916,577.402893 709.889404,577.390442 
	C677.056580,577.315979 644.223022,577.459473 611.391052,577.282471 
	C604.348022,577.244507 597.692017,579.780334 590.645996,579.512756 
	C587.875427,579.407471 586.705994,582.013977 587.653198,584.150940 
	C590.725159,591.081238 588.879883,598.269897 589.291870,605.319580 
	C589.613403,610.820618 590.426514,611.643433 595.485413,609.886230 
	C600.922302,607.997864 606.655334,608.693665 612.235168,607.817932 
	C639.120972,603.598633 666.087585,599.894226 693.024719,596.001709 
	C700.428223,594.931885 707.813538,593.718445 715.235535,592.799561 
	C722.520874,591.897522 728.983276,593.660950 732.972229,600.322937 
	C736.625244,606.424072 736.385315,612.690979 732.332947,618.664246 
	C729.748779,622.473328 726.054199,624.606140 721.587708,625.274170 
	C692.324890,629.651428 662.904663,633.182068 633.851501,638.662659 
	C620.446228,641.191528 606.832703,642.799194 593.572815,646.173584 
	C591.139648,646.792725 591.221252,648.527283 590.941528,650.357056 
	C589.827820,657.641663 589.901794,664.979004 589.969971,672.304443 
	C590.106323,686.960266 589.445435,701.628479 590.608215,716.271973 
	C590.711670,717.574341 590.341492,718.914246 590.095642,720.618408 
	C579.312439,721.000000 568.624878,721.000000 557.468628,721.000000 
z"
              />
              <path
                fill="#000000"
                opacity="1.000000"
                stroke="none"
                d="
M518.454590,348.817444 
	C505.713470,340.815582 509.412537,321.934601 519.690918,317.776703 
	C528.065308,314.389008 539.802551,314.928925 545.165466,326.092834 
	C549.146606,334.380371 545.671448,345.627960 536.844788,349.752319 
	C530.976807,352.494202 524.658997,352.595612 518.454590,348.817444 
z"
              />
              <path
                fill="#000000"
                opacity="1.000000"
                stroke="none"
                d="
M385.710510,329.179108 
	C379.678680,318.833862 382.051697,308.410278 391.630310,302.842133 
	C398.592102,298.795227 411.396759,299.781403 416.561096,309.994690 
	C422.314056,321.372070 415.752838,336.746185 401.460785,336.463715 
	C394.966705,336.335388 389.823456,334.622437 385.710510,329.179108 
z"
              />
            </svg>
          </div>
          <div
            style={{
              textAlign: "center",
              position: "absolute",
              maxWidth: "90%",
            }}
          >
            {sentence}
          </div>
          <div
            style={{
              position: "absolute",
              top: "468px",
              left: "627px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "180px",
              height: "180px",
              fontSize: 180,
            }}
          >
            {outputElement}
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: "Inter",
            data: await font,
            style: "normal",
            weight: 400,
          },
        ],
      }
    );
  } catch (error) {
    console.log(error);
    return new Response("Error generating meme", { status: 500 });
  }
}

const generatePrompt = (query: string) => `
I am making a meme website, and you're the core ai behind it. Your task is to generate good structured response for me. So, basically i ask users "what do you want?", and the user responds. based on the query, i show a meme. But there are some special cases. In the meme I render "Yeh lo tumhare liye ${query} leke aya hu". So its a Hindi statement, so the user query can be in hindi, please convert it to english if its not in english.

Your output structure: { type: string output: string } json schema
There are three types: 1. emoji 2. image 3. outsource 4. direct_image

Here's the list of direct image you can use:
1. https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif
2. https://whatyouwant.rdsx.dev/special-case/enemy-meme.jpeg
3. https://whatyouwant.rdsx.dev/special-case/foodie.jpeg
4. https://whatyouwant.rdsx.dev/special-case/robber.gif
5. https://whatyouwant.rdsx.dev/special-case/gf.gif
6. https://whatyouwant.rdsx.dev/special-case/soulmate.png

If anyone tries to flirt, like they respond with "you" or kiss or hug or boyfriend or similar romantic query, respond with the direct image "https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif"
If anyone asks for gf, girlfriend, lady, woman, wife, cute girl, or female figure, respond with the direct image: "https://whatyouwant.rdsx.dev/special-case/gf.gif"
If anyone asks for soulmate, lover, partner, friend, or similar wholesome query respond with the direct image: "https://whatyouwant.rdsx.dev/special-case/soulmate.png"
If anyone tries to say something rude or cute or something villain-ish like blood, or anything that will make someone angry or similar, respond with the direct image "https://whatyouwant.rdsx.dev/special-case/enemy-meme.jpeg"
If anyone asks for heavy food, like pizza, burger, rice or heavy food, respond with the direct image: "https://whatyouwant.rdsx.dev/special-case/foodie.jpeg"
Anything related to money, or rich, or gold or diamond or similar, respond with the direct image: "http://localhost:3000/special-case/robber.gif"

Here're some special cases:
query - cat / kitten or similar, respond with any one of these images:
1. https://whatyouwant.rdsx.dev/special-case/cat.png
2. https://whatyouwant.rdsx.dev/special-case/cat-sleep.jpeg
3. https://whatyouwant.rdsx.dev/special-case/cat-smol.jpeg
4. https://whatyouwant.rdsx.dev/special-case/cat-upset.jpeg

If cute cat, or cute pet, or baby respond with this image: https://whatyouwant.rdsx.dev/special-case/pookie.jpeg

If anyone asks for cold coffee/iced coffee, respond with the image: https://whatyouwant.rdsx.dev/special-case/cold-coffee.png
For milkshake: https://whatyouwant.rdsx.dev/special-case/milkshake.jpg
For iphone: https://whatyouwant.rdsx.dev/special-case/iphone.png

And for other cases, try responding with a single emoji.

And if all the cases fails, just respond with outsource type, and query itself

Examples:
1. query: "cat", response: { type: "image", output: "https://whatyouwant.rdsx.dev/special-case/cat.png" }
2. query: "cute cat", response: { type: "image", output: "https://whatyouwant.rdsx.dev/special-case/pookie.jpeg" }
3. query: "cold coffee", response: { type: "image", output: "https://whatyouwant.rdsx.dev/special-case/cold-coffee.png" }
4. query: "iphone", response: { type: "image", output: "https://whatyouwant.rdsx.dev/special-case/iphone.png" }
5. query: "pizza", response: { type: "direct_image", output: "https://whatyouwant.rdsx.dev/special-case/foodie.jpeg" }
6. query: "you", response: { type: "direct_image", output: "https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif" }
7. query: "laptop", response: { type: "emoji", output: "💻" }
8. query: "you're cute", response: { type: "direct_image", output: "https://c.tenor.com/O69qbS-sDkUAAAAC/tenor.gif" }
9. query: "enemy", response: { type: "direct_image", output: "https://whatyouwant.rdsx.dev/special-case/enemy-meme.jpeg" }
10. query: "tea", response: { type: "emoji", output: "🍵" }
11. query: "tree", response: { type: "outsource", output: "tree" }
12. query: "dog", response: { type: "outsource", output: "dog" }


Try your best to just use special cases, and emojis. if not then just use outsource type.
Remember user can use "bengali" or "hindi" language. When you need to use outsource type and query is in different language than english, convert it to english so that its easier to find out the image.
MAKE SURE TO USE "outsource" TYPE WHEN YOU ARE SIMPLY USING THE QUERY AS OUTPUT.
Here's the query: ${query}
`;
