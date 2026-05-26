import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockSuppliers = [
  { name: "Acme Pharmaceutics", region: "North America", material: "Active Pharmaceutical Ingredients", riskScore: 15 },
  { name: "Global MedSupply", region: "Southeast Asia", material: "Sterile Packaging", riskScore: 85 },
  { name: "EuroSynthetics", region: "Europe", material: "Chemical Precursors", riskScore: 42 },
  { name: "Andes BioCorp", region: "South America", material: "Plant Extracts", riskScore: 60 },
  { name: "Oceanic Plastics", region: "Oceania", material: "Medical Grade Plastics", riskScore: 92 },
];

export function RiskMatrix() {
  return (
    <div className="flex flex-col p-8 space-y-6 w-full h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Supplier Risk Matrix</h1>
        <p className="text-muted-foreground mt-2">Live evaluation of global upstream dependencies.</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Primary Material</TableHead>
              <TableHead className="text-right">Risk Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSuppliers.map((supplier) => {
              let scoreColor = "text-foreground";
              if (supplier.riskScore > 80) {
                scoreColor = "text-destructive font-bold";
              } else if (supplier.riskScore < 30) {
                scoreColor = "text-primary font-bold";
              }

              return (
                <TableRow key={supplier.name}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.region}</TableCell>
                  <TableCell>{supplier.material}</TableCell>
                  <TableCell className={`text-right ${scoreColor}`}>
                    {supplier.riskScore}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}