// TECHUVO_SCANNED_PBR_V1 — Poly Haven CC0 assets; see public/materials/scanned/provenance.json
import {useMemo, useEffect} from "react";
import {useTexture} from "@react-three/drei";
import * as THREE from "three";
import materialLibrary from "../../data/techuvoMaterialLibrary.json";
import installedPbr from "../../data/installedPbrMaterials.json";
import type {FloorMaterialId, WallMaterialId} from "../../types/architecture";

type Finish = WallMaterialId | FloorMaterialId;
type Props = {finish: Finish; width?: number; height?: number; selected?:boolean; side?: THREE.Side; tint?:string; worldUV?: boolean};
const base = import.meta.env.BASE_URL;
const wood = "materials/wood-floor/WoodFloor051_1K-JPG_";
const spec: Record<string, {albedo:string; normal:string; rough:string; tint:string; roughness:number; tile:number; bump:number; clearcoat?:number; clearcoatRoughness?:number}> = {
  "plaster-white": {albedo:"materials/scanned/plaster/color.jpg",normal:"materials/scanned/plaster/normal.jpg",rough:"materials/scanned/plaster/roughness.jpg",tint:"#f7f5f0",roughness:.95,tile:1.25,bump:.22},
  "plaster-warm": {albedo:"materials/scanned/plaster/color.jpg",normal:"materials/scanned/plaster/normal.jpg",rough:"materials/scanned/plaster/roughness.jpg",tint:"#d7c5ae",roughness:.95,tile:1.25,bump:.22},
  "oak-panel": {albedo:"materials/scanned/oak/color.jpg",normal:"materials/scanned/oak/normal.jpg",rough:"materials/scanned/oak/roughness.jpg",tint:"#d1b58d",roughness:.71,tile:1.5,bump:.26,clearcoat:.06,clearcoatRoughness:.45},
  "walnut-panel": {albedo:"materials/scanned/oak/color.jpg",normal:"materials/scanned/oak/normal.jpg",rough:"materials/scanned/oak/roughness.jpg",tint:"#76503b",roughness:.68,tile:1.5,bump:.26,clearcoat:.09,clearcoatRoughness:.45},
  "brick-red": {albedo:"materials/scanned/brick/color.jpg",normal:"materials/scanned/brick/normal.jpg",rough:"materials/scanned/brick/roughness.jpg",tint:"#ffffff",roughness:.92,tile:1.0,bump:.48},
  "limestone": {albedo:"materials/scanned/limestone/color.jpg",normal:"materials/scanned/limestone/normal.jpg",rough:"materials/scanned/limestone/roughness.jpg",tint:"#ffffff",roughness:.83,tile:1.25,bump:.31},
  "concrete": {albedo:"materials/scanned/concrete/color.jpg",normal:"materials/scanned/concrete/normal.jpg",rough:"materials/scanned/concrete/roughness.jpg",tint:"#ffffff",roughness:.81,tile:1.8,bump:.24},
  "siding-charcoal": {albedo:"materials/scanned/siding/color.jpg",normal:"materials/scanned/siding/normal.jpg",rough:"materials/scanned/siding/roughness.jpg",tint:"#ffffff",roughness:.77,tile:1.5,bump:.28,clearcoat:.02,clearcoatRoughness:.45},
  "oak-natural": {albedo:"materials/scanned/oak/color.jpg",normal:"materials/scanned/oak/normal.jpg",rough:"materials/scanned/oak/roughness.jpg",tint:"#ffffff",roughness:.72,tile:1.35,bump:.28,clearcoat:.06,clearcoatRoughness:.45},
  "oak-dark": {albedo:"materials/scanned/oak/color.jpg",normal:"materials/scanned/oak/normal.jpg",rough:"materials/scanned/oak/roughness.jpg",tint:"#725345",roughness:.7,tile:1.35,bump:.28,clearcoat:.08,clearcoatRoughness:.45},
  "marble-white": {albedo:"materials/scanned/marble/color.jpg",normal:"materials/scanned/marble/normal.jpg",rough:"materials/scanned/marble/roughness.jpg",tint:"#ffffff",roughness:.38,tile:1.5,bump:.09,clearcoat:.15,clearcoatRoughness:.45},
  "concrete-polished": {albedo:"materials/scanned/concrete/color.jpg",normal:"materials/scanned/concrete/normal.jpg",rough:"materials/scanned/concrete/roughness.jpg",tint:"#ffffff",roughness:.54,tile:1.8,bump:.16,clearcoat:.08,clearcoatRoughness:.45},
  "ceramic-tile": {albedo:"materials/scanned/tile/color.jpg",normal:"materials/scanned/tile/normal.jpg",rough:"materials/scanned/tile/roughness.jpg",tint:"#ffffff",roughness:.6,tile:.6,bump:.16,clearcoat:.10,clearcoatRoughness:.45},
  "stone-travertine": {albedo:"materials/scanned/limestone/color.jpg",normal:"materials/scanned/limestone/normal.jpg",rough:"materials/scanned/limestone/roughness.jpg",tint:"#ded0b7",roughness:.77,tile:1.3,bump:.32},
  "outdoor-pavers": {albedo:"materials/scanned/pavers/color.jpg",normal:"materials/scanned/pavers/normal.jpg",rough:"materials/scanned/pavers/roughness.jpg",tint:"#bdb3a6",roughness:.88,tile:.6,bump:.30},
  "pool-water": {albedo:"materials/architectural/water-color.png",normal:"materials/architectural/water-normal.png",rough:"materials/architectural/water-roughness.png",tint:"#ffffff",roughness:.16,tile:2.5,bump:.20,clearcoat:.45,clearcoatRoughness:.45},
  "custom": {albedo:wood+"Color.jpg",normal:wood+"NormalGL.jpg",rough:wood+"Roughness.jpg",tint:"#ded1bd",roughness:.8,tile:1.5,bump:.25}
};
export default function ArchitecturalSurfaceMaterial({finish,width=2,height=2,selected=false,side=THREE.FrontSide,tint,worldUV=false}:Props){
  const libraryId=finish.startsWith("library:") ? finish.slice(8) : "";
  const entry=libraryId ? materialLibrary.find(item=>item.id===libraryId) : undefined;
  const dm=entry?.dimensions_mm;
  const physicalScale=dm && dm[0] && dm[0]>0 ? Math.max(.1, Math.min(10, dm[0]/1000)) : 1;
  const online=installedPbr.find(item=>`library:${item.id}`===finish);
  const s=online
    ? {albedo:online.color,normal:online.normal,rough:online.roughness,tint:"#ffffff",roughness:1,tile:1,bump:.35}
    : entry
      ? {albedo:`material-library/assets/${entry.id}/color.jpg`,normal:`material-library/assets/${entry.id}/normal.jpg`,rough:`material-library/assets/${entry.id}/roughness.jpg`,tint:"#ffffff",roughness:.85,tile:physicalScale,bump:.25}
      : spec[finish] ?? spec["plaster-white"];
  const paths=[s.albedo,s.normal,s.rough].map(p=>base+p) as [string,string,string];
  const source=useTexture(paths);
  const maps=useMemo(()=>source.map((src,i)=>{
    const tex=src.clone(); tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
    tex.repeat.set(worldUV?1/s.tile:Math.max(.1,width/s.tile),worldUV?1/s.tile:Math.max(.1,height/s.tile));
    tex.anisotropy=16; if(i===0) tex.colorSpace=THREE.SRGBColorSpace;
    tex.needsUpdate=true; return tex;
  }),[source,width,height,s.tile,worldUV]);
  useEffect(()=>()=>maps.forEach(t=>t.dispose()),[maps]);
  return <meshPhysicalMaterial color={selected?"#e8c58a":(tint||s.tint)} map={maps[0]} normalMap={maps[1]}
    normalScale={new THREE.Vector2(s.bump,s.bump)} roughnessMap={maps[2]} roughness={s.roughness}
    clearcoat={s.clearcoat??0} clearcoatRoughness={s.clearcoatRoughness??.5}
    metalness={0} side={side}/>;
}
