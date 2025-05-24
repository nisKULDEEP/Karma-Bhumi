import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { getProjectTemplatesQueryFn } from '@/lib/api';
import { Loader, Layout, List, BarChart2, Users } from 'lucide-react';

export type ProjectTemplateType = {
  _id: string;
  name: string;
  category: string;
  description: string;
  defaultView: string;
  taskStatuses: Array<{ name: string; color: string }>;
};

// Map template categories to icons
const categoryIcons: Record<string, React.ReactNode> = {
  SCRUM: <List size={24} />,
  KANBAN: <Layout size={24} />,
  MARKETING: <BarChart2 size={24} />,
  SALES: <Users size={24} />
};

interface ProjectTemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
}

export default function ProjectTemplateSelector({ 
  selectedTemplateId, 
  onSelectTemplate 
}: ProjectTemplateSelectorProps) {
  const { 
    data: templatesData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['projectTemplates'],
    queryFn: getProjectTemplatesQueryFn
  });

  const templates = templatesData?.templates || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium">Choose a template</h3>
          <p className="text-sm text-muted-foreground">
            Select a template that best matches your project needs
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8 border rounded-md border-dashed">
          <Loader className="h-5 w-5 animate-spin mr-2" />
          <span>Loading templates...</span>
        </div>
      ) : error ? (
        <div className="p-6 border rounded-md border-dashed text-center">
          <p className="text-muted-foreground">Failed to load templates. Please try again.</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="p-6 border rounded-md border-dashed text-center">
          <p className="text-muted-foreground">No templates available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template: ProjectTemplateType) => (
            <Card 
              key={template._id} 
              className={`cursor-pointer transition-all hover:border-primary ${
                selectedTemplateId === template._id ? 'border-2 border-primary' : ''
              }`}
              onClick={() => onSelectTemplate(template._id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-primary mt-1">
                    {categoryIcons[template.category] || <Layout size={24} />}
                  </div>
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="mt-1">
                        {template.category.toLowerCase()}
                      </Badge>
                      <Badge variant="outline" className="mt-1">
                        {template.defaultView.toLowerCase()} view
                      </Badge>
                      <Badge variant="outline" className="mt-1">
                        {template.taskStatuses.length} statuses
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}