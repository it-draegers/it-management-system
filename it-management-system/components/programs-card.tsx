"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, MonitorSmartphone, Disc3, Search } from "lucide-react";
import { redirect } from "next/dist/server/api-utils";
import { set } from "date-fns";
import { getAssetWithPrograms } from "@/lib/actions/program";

export type Program = {
  _id?: string;
  name: string;
  version?: string;
  vendor?: string;
  logoUrl?: string;
};

interface ProgramsCardProps {
  assetId: string;
  programs: Program[];
  onAddProgram: (assetId: string, program: Program) => Promise<void>;
  onRemoveProgram?: (assetId: string, programId: string) => Promise<void>;
}

const KNOWN_PROGRAMS: Program[] = [
  {
    name: "Google Chrome",
    vendor: "Google",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=google.com",
  },
  {
    name: "Mozilla Firefox",
    vendor: "Mozilla",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=mozilla.org",
  },
  {
    name: "Microsoft Edge",
    vendor: "Microsoft",
    logoUrl:
      "https://www.google.com/s2/favicons?sz=64&domain_url=microsoft.com",
  },

  {
    name: "Zoom",
    vendor: "Zoom",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=zoom.us",
  },
  {
    name: "Slack",
    vendor: "Slack",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=slack.com",
  },
  {
    name: "Microsoft Teams",
    vendor: "Microsoft",
    logoUrl:
      "https://www.google.com/s2/favicons?sz=64&domain_url=teams.microsoft.com",
  },

  {
    name: "Visual Studio Code",
    vendor: "Microsoft",
    logoUrl:
      "https://www.google.com/s2/favicons?sz=64&domain_url=code.visualstudio.com",
  },

  {
    name: "Microsoft Office",
    vendor: "Microsoft",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=office.com",
  },

  {
    name: "QuickBooks",
    vendor: "Intuit",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=intuit.com",
  },

  {
    name: "Foxit Reader",
    vendor: "Foxit",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=foxit.com",
  },
  {
    name: "Foxit PhantomPDF",
    vendor: "Foxit",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=foxit.com",
  },
  {
    name: "Adobe Acrobat Reader",
    vendor: "Adobe",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=adobe.com",
  },
  {
    name: "Adobe Acrobat Pro",
    vendor: "Adobe",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=adobe.com",
  },
  {
    name: "Outlook",
    vendor: "Microsoft",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=office.com",
  },

  {
    name: "LogMeIn",
    vendor: "LogMeIn",
    logoUrl: "https://www.google.com/s2/favicons?sz=64&domain_url=logmein.com",
  },
];

export function ProgramsCard({
  assetId,
  programs,
  onAddProgram,
  onRemoveProgram,
}: ProgramsCardProps) {
  const [programList, setProgramList] = useState<Program[]>(programs);

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [vendor, setVendor] = useState("");
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestionsList, setSuggestionsList] = useState(false);
  const [appList, setAppList] = useState(false);
    const inputWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setProgramList(programs);
    console.log(apps);
  }, [programs]);
  const apps = useMemo(() => {
    return KNOWN_PROGRAMS.map((p) => p);
  }, [name]);
 useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(event.target as Node)
      ) {
        setSuggestionsList(false);
        setAppList(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const suggestions = useMemo(() => {
    const query = name.trim().toLowerCase();
    if (!query) return [];
    return KNOWN_PROGRAMS.filter((p) =>
      p.name.toLowerCase().includes(query),
    ).slice(0, 6);
  }, [name]);

  

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSuggestionsList(false);
     
    const normalizedName = name.trim();
    if (!normalizedName) {
      setError("Program name is required");
      return;
    }
const exists = programList.some(
      (p) => p.name.trim().toLowerCase() === normalizedName.toLowerCase(),
    );
   
    if (exists) {
      setError("This program is already added to this asset.");
      return;
    }
    setError("");
    setLoading(true);

    const payload: Program = {
      name: name.trim(),
      version: version.trim() || undefined,
      vendor: vendor.trim() || undefined,
      logoUrl: selectedLogoUrl,
    };

    try {
      await onAddProgram(assetId, payload);

      setProgramList((prev) => [
        ...prev,
        { ...payload, _id: Math.random().toString(36).slice(2) },
      ]);
      setTimeout(() => {
        window.location.reload();
      }, 1000);


      const updatedPrograms = await getAssetWithPrograms(assetId);
      console.log("Updated programs:", updatedPrograms);
      setName("");
      setVersion("");
      setVendor("");
      setSelectedLogoUrl(undefined);
      setIsAdding(false);
    } catch (err) {
      console.error(err);

      setError("Failed to add program");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  function handleRefresh() {
   // if (!name.trim() || error) {
     // return;
    //}
    console.log(error);
    //setTimeout(() => {
      //window.location.reload();
    //}, 1000);
  }

  async function handleRemove(programId?: string) {
    if (!onRemoveProgram || !programId) return;
    try {
      await onRemoveProgram(assetId, programId);
      setProgramList((prev) => prev.filter((p) => p._id !== programId));
    } catch (err) {
      console.error(err);
    }
  }

  function handleSelectSuggestion(s: Program) {
    setName(s.name);
    setVendor(s.vendor ?? "");
    setSelectedLogoUrl(s.logoUrl);
    setSuggestionsList(false);
  }

  function handleSelectApp(s: Program) {
    setName(s.name);
    setVendor(s.vendor ?? "");
    setSelectedLogoUrl(s.logoUrl);
    setSuggestionsList(false);
    setAppList(false);
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSuggestionsList(true);
    setName(value);
    setError("");

    setSelectedLogoUrl(undefined);

    const exact = KNOWN_PROGRAMS.find(
      (p) => p.name.toLowerCase() === value.trim().toLowerCase(),
    );
    if (exact) {
      setVendor(exact.vendor ?? "");
      setSelectedLogoUrl(exact.logoUrl);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <Card className="border-border overflow-hidden bg-background/90 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold text-foreground">
              Installed Programs
            </CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="cursor-pointer gap-1"
            onClick={() => {
              setIsAdding((prev) => !prev);
              setError("");
            }}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Add form */}
          <AnimatePresence initial={false}>
            {isAdding && (
              <motion.form
                onSubmit={handleAdd}
                className="grid gap-2 rounded-lg border border-border/70 bg-muted/40 p-3"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
              >
                <div className="grid gap-2 md:grid-cols-3"
                    ref={inputWrapperRef}             
>
                  <div className="relative md:col-span-1">
                    <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Search className="h-3.5 w-3.5" />
                    </div>
                    <Input
                      placeholder="Program name (e.g. Google Chrome)"
                      value={name}
                      onChange={handleNameChange}
                      autoFocus
                      className="pl-7"
                      onClick={() => {
                        setAppList(true);
                        console.log(apps);
                      }}
                    />
                    {/* Suggestions dropdown */}
                    <AnimatePresence>
                      {suggestionsList ? (
                        <motion.ul
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover text-sm shadow-lg"
                        >
                          {suggestions.map((s) => (
                            <li
                              key={s.name}
                              className="flex cursor-pointer items-center gap-2 px-2 py-1.5 hover:bg-muted"
                              onClick={() => handleSelectSuggestion(s)}
                            >
                              <div className="relative h-5 w-5 overflow-hidden rounded bg-muted flex items-center justify-center">
                                {s.logoUrl ? (
                                  <Image
                                    src={s.logoUrl}
                                    alt={s.name}
                                    fill
                                    className="object-contain p-0.5"
                                  />
                                ) : (
                                  <Disc3 className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-foreground">
                                  {s.name}
                                </span>
                                {s.vendor && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {s.vendor}
                                  </span>
                                )}
                              </div>
                            </li>
                          ))}
                          <li className="border-t border-border px-2 py-1.5 text-[10px] text-muted-foreground">
                            You can also type a custom program name and click
                            &quot;Add Program&quot;.
                          </li>
                        </motion.ul>
                      ) : (
                        appList && (
                          <motion.ul
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-popover text-sm shadow-lg"
                          >
                            {apps.map((app) => (
                              <li
                                key={app.name}
                                className="flex cursor-pointer items-center gap-2 px-2 py-1.5 hover:bg-muted"
                                onClick={() => {
                                  setName(app.name);
                                  setSuggestionsList(false);
                                  setAppList(false);
                                  setVendor(app.vendor ?? "");
                                  setSelectedLogoUrl(app.logoUrl);
                                }}
                              >
                                <div className="relative h-5 w-5 overflow-hidden rounded bg-muted flex items-center justify-center">
                                  {app.logoUrl ? (
                                    <Image
                                      src={app.logoUrl}
                                      alt={app.name}
                                      fill
                                      className="object-contain p-0.5"
                                    />
                                  ) : (
                                    <Disc3 className="h-3.5 w-3.5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-medium text-foreground">
                                    {app.name}
                                  </span>
                                  {app.vendor && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {app.vendor}
                                    </span>
                                  )}
                                </div>
                              </li>
                            ))}
                            <li className="border-t border-border px-2 py-1.5 text-[10px] text-muted-foreground">
                              You can also type a custom program name and click
                              &quot;Add Program&quot;.
                            </li>
                          </motion.ul>
                        )
                      )}
                    </AnimatePresence>
                  </div>

                  <Input
                    placeholder="Version (optional)"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                  />
                  <Input
                    placeholder="Vendor (optional)"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                  />
                </div>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => {
                      setIsAdding(false);
                      setError("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="cursor-pointer"
                    disabled={loading}
                    onClick={handleRefresh}
                  >
                    {loading ? "Adding..." : "Add Program"}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* List of programs */}
          {programList.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-6 text-center">
              <Disc3 className="h-6 w-6 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                No programs recorded for this asset yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Use &quot;Add&quot; to track installed software on this device.
              </p>
            </div>
          ) : (
           <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {programList.map((program) => (
                  <motion.div
                    key={program._id ?? program.name}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-background/80 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-muted">
                        {program.logoUrl ? (
                          <Image
                            src={program.logoUrl}
                            alt={program.name}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <Disc3 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {program.name}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {program.version && <span>v{program.version}</span>}
                          {program.vendor && (
                            <Badge variant="outline" className="text-[10px]">
                              {program.vendor}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {onRemoveProgram && program._id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(program._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
