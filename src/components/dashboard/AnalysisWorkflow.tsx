"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { analyzeEyeHealthAndSymptoms } from '@/ai/flows/analyze-eye-health-and-symptoms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Download, FileText, Activity, BarChart, FileWarning, CheckCircle, Info, TrendingUp, ShieldAlert, ListChecks, FileHeart, Beaker, Stethoscope, Leaf, EyeOff, Scale } from 'lucide-react';
import { AnalysisInputSchema, type AnalysisInputData, type AnalysisResult } from '@/lib/types';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


interface AnalysisWorkflowProps {
  imageData: string | null;
}

export default function AnalysisWorkflow({ imageData }: AnalysisWorkflowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AnalysisInputData>({
    resolver: zodResolver(AnalysisInputSchema),
    defaultValues: {
      age: '' as any,
      gender: '',
    },
  });

  const onSubmit = async (data: AnalysisInputData) => {
    if (!imageData) {
      toast({
        variant: "destructive",
        title: "Image Required",
        description: "Please capture an eye scan image before starting the analysis.",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeEyeHealthAndSymptoms({
        eyeImageDataUri: imageData,
        ...data,
        age: Number(data.age)
      });
      setAnalysisResult(result);
    } catch (e: any) {
      console.error(e);
      setError("An error occurred during analysis. Please try again.");
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: e.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (analysisResult) {
      const printableContent = document.getElementById('printable-report');
      if (printableContent) {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write('<html><head><title>OcuCheck AI Analysis Report</title>');
        printWindow?.document.write('<style>body { font-family: sans-serif; } pre { white-space: pre-wrap; word-wrap: break-word; }</style>');
        printWindow?.document.write('</head><body>');
        printWindow?.document.write(printableContent.innerHTML);
        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.print();
      }
    }
  };

  const renderResult = () => {
    if (!analysisResult) return null;

    if (!analysisResult.is_eye_present) {
      return (
        <Alert variant="destructive">
          <EyeOff className="h-4 w-4" />
          <AlertTitle>No Eye Detected</AlertTitle>
          <AlertDescription>
            {analysisResult.recommended_next_steps || "The AI could not detect an eye in the image. Please try retaking the scan, ensuring your eye is clear and in focus."}
          </AlertDescription>
        </Alert>
      );
    }
    
    const getRiskBadgeClasses = (risk: string) => {
      switch (risk.toLowerCase()) {
        case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
        case 'medium': return 'bg-yellow-400/10 text-yellow-500 border-yellow-400/20';
        case 'low':
        default: return 'bg-green-500/10 text-green-600 border-green-500/20';
      }
    }
    
    const getUrgencyClasses = (urgency: string) => {
        switch (urgency.toLowerCase()) {
            case 'immediately': return 'bg-red-500/90 text-white';
            case 'within a week': return 'bg-yellow-400/90 text-yellow-900';
            case 'no urgency':
            default: return 'bg-green-500/90 text-white';
        }
    }

    return (
      <>
        <div id="printable-report" className="hidden print:block">
           <h1 className="text-2xl font-bold mb-4">OcuCheck AI Analysis Report</h1>
           <pre className="whitespace-pre-wrap font-sans text-sm">{analysisResult.reportMarkdown}</pre>
        </div>
        <Card className="shadow-lg print:hidden">
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-2xl mb-2">
                          <TrendingUp className="h-6 w-6 text-primary" />
                          <span>AI Eye Scan Analysis Report</span>
                        </CardTitle>
                        <CardDescription>A summary of your AI-powered eye scan health analysis.</CardDescription>
                    </div>
                    <Button onClick={handleDownload} variant="outline" size="sm" className="shrink-0">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                </div>
            </CardHeader>
          <CardContent className="space-y-6">
                <Alert className={cn("border-2 shadow-md", getUrgencyClasses(analysisResult.urgency))}>
                    <ShieldAlert className="h-5 w-5" />
                    <AlertTitle className="font-bold text-lg">Urgency: {analysisResult.urgency}</AlertTitle>
                </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className='bg-background'>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            Risk Level Assessment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className={cn("text-lg font-semibold px-4 py-1", getRiskBadgeClasses(analysisResult.risk_level))} variant="outline">
                            {analysisResult.risk_level}
                        </Badge>
                    </CardContent>
                </Card>
                <Card className='bg-background'>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2 text-lg">
                            <ListChecks className="h-5 w-5 text-primary" />
                            Possible Conditions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {analysisResult.possible_conditions.length > 0 ? (
                              analysisResult.possible_conditions.map((condition, index) => (
                                <li key={index}>{condition}</li>
                              ))
                            ) : (
                              <li>No specific indicators detected for tracked conditions.</li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-semibold">
                  <div className="flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-primary" />
                    Smart Test Recommendations
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="space-y-4">
                    {analysisResult.smart_test_recommendations.length > 0 ? (
                      analysisResult.smart_test_recommendations.map((test, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-semibold">{test.test_name}</p>
                          <p className="text-sm text-muted-foreground">{test.reason}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific tests recommended based on this scan.</p>
                    )}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                       <h4 className="font-semibold flex items-center gap-2"><Stethoscope className="h-4 w-4" /> Specialist to Consult</h4>
                       <p className="text-sm text-blue-700">{analysisResult.specialist_recommendation || "General Practitioner"}</p>
                    </div>
                     <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                       <h4 className="font-semibold flex items-center gap-2"><Leaf className="h-4 w-4" /> Lifestyle Tips</h4>
                       <ul className="list-disc list-inside text-sm text-green-800 space-y-1 mt-2">
                         {analysisResult.lifestyle_tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                         ))}
                       </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>


            <Card className='bg-background'>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileHeart className="h-5 w-5 text-primary" />
                        Recommended Next Steps
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{analysisResult.recommended_next_steps}</p>
                </CardContent>
            </Card>

            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className='font-semibold'>Disclaimer</AlertTitle>
              <AlertDescription>
                This is an AI-generated report and not a substitute for professional medical advice. The recommendations are for awareness and should be discussed with a qualified healthcare professional.
              </AlertDescription>
            </Alert>

          </CardContent>
        </Card>
      </>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyzing...</CardTitle>
          <CardDescription>AI is processing your health data. Please wait.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
       <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  if (analysisResult) {
    return renderResult();
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Health Details</CardTitle>
          <CardDescription>Enter your details to begin the analysis. An eye scan image must be captured first.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 35" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={isLoading || !imageData} className="w-full" size="lg">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                Start AI Analysis
              </Button>
              {!imageData && (
                <p className="text-center text-sm text-yellow-600 font-medium">Please capture an eye scan image to enable analysis.</p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Scale className="h-4 w-4 text-muted-foreground" />
            Accuracy & Limitations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>
            OcuCheck AI is an awareness tool designed to identify visual biomarkers. It is not a clinical diagnostic device.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Accuracy depends on high-quality lighting and clear focus.</li>
            <li>Biomarkers like eye redness are often benign and should not cause alarm.</li>
            <li>This tool is currently specialized for Jaundice, Stroke, Brain Tumor, and Thyroid Disorder indicators only.</li>
            <li>Always consult a medical professional for a definitive diagnosis.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
