export type TicketFields = {
  airline?: string; locator?: string; passenger?: string; surname?: string;
  origin?: string; destination?: string; departureDate?: string; departureTime?: string;
};

const months: Record<string,string> = { JAN:"01",FEV:"02",FEB:"02",MAR:"03",ABR:"04",APR:"04",MAI:"05",MAY:"05",JUN:"06",JUL:"07",AGO:"08",AUG:"08",SET:"09",SEP:"09",OUT:"10",OCT:"10",NOV:"11",DEZ:"12",DEC:"12" };

function isoDate(text:string) {
  const numeric=text.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](20\d{2})\b/);
  if(numeric) return `${numeric[3]}-${numeric[2].padStart(2,"0")}-${numeric[1].padStart(2,"0")}`;
  const written=text.toUpperCase().match(/\b(\d{1,2})\s*(JAN|FEV|FEB|MAR|ABR|APR|MAI|MAY|JUN|JUL|AGO|AUG|SET|SEP|OUT|OCT|NOV|DEZ|DEC)[A-Z]*\s*(20\d{2})?\b/);
  if(written) return `${written[3]||new Date().getFullYear()}-${months[written[2]]}-${written[1].padStart(2,"0")}`;
  return undefined;
}

export function parseTicketText(raw:string):TicketFields {
  const text=raw.replace(/\s+/g," ").trim(); const upper=text.toUpperCase();
  const airline = upper.includes("LATAM")?"LATAM":upper.includes("VOEGOL")||upper.includes("GOL LINHAS")?"GOL":upper.includes("AZUL")?"Azul":upper.includes("FLY TAP")||upper.includes("TAP AIR")?"TAP":upper.includes("IBERIA")?"Iberia":upper.includes("AMERICAN AIRLINES")?"American":upper.includes("COPA AIRLINES")?"Copa":undefined;
  const locator = text.match(/(?:LOCALIZADOR|C[ÓO]DIGO\s+DA\s+RESERVA|RESERVATION\s+CODE|BOOKING\s+(?:CODE|REFERENCE)|PNR)\s*[:#-]?\s*([A-Z0-9]{5,8})/i)?.[1]?.toUpperCase();
  const passenger = text.match(/(?:PASSAGEIRO|PASSENGER|NOME\s+DO\s+PASSAGEIRO)\s*[:#-]?\s*([A-ZÀ-Ú][A-ZÀ-Ú' -]{4,50}?)(?=\s{2,}|\s(?:VOO|FLIGHT|TRECHO|ORIGEM|FROM|DATA|DATE)\b)/i)?.[1]?.trim().replace(/\s+/g," ");
  const route = upper.match(/\b([A-Z]{3})\s*(?:→|>|-|TO|PARA)\s*([A-Z]{3})\b/) || upper.match(/(?:ORIGEM|FROM)\s*[:#-]?\s*([A-Z]{3}).{0,80}?(?:DESTINO|TO)\s*[:#-]?\s*([A-Z]{3})/);
  const airportCodes=[...upper.matchAll(/\b[A-Z]{3}\b/g)].map(m=>m[0]).filter(code=>!['TAP','GOL','LAT','PNR'].includes(code));
  const origin=route?.[1] || airportCodes[0]; const destination=route?.[2] || airportCodes[1];
  const time=text.match(/(?:HOR[ÁA]RIO|DEPARTURE|PARTIDA|SA[ÍI]DA)?\s*[:#-]?\s*([0-2]\d:[0-5]\d)\b/i)?.[1];
  const cleanPassenger=passenger?.replace(/\s+(MR|MRS|MS|SR|SRA)$/i,"");
  return { airline, locator, passenger:cleanPassenger, surname:cleanPassenger?.split(" ").at(-1), origin, destination, departureDate:isoDate(text), departureTime:time };
}

export async function readTicket(file:File):Promise<{text:string;fields:TicketFields}> {
  let text="";
  if(file.type==="application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const pdfjs=await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url).toString();
    const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
    for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);const content=await page.getTextContent();text+=content.items.map(item=>"str" in item?item.str:"").join(" ")+"\n";}
  } else {
    const { recognize }=await import("tesseract.js");
    const result=await recognize(file,"por+eng"); text=result.data.text;
  }
  return { text, fields:parseTicketText(text) };
}
