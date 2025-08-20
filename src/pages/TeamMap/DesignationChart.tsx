    import React, {useEffect, useState, useRef} from 'react';
    import * as d3 from 'd3';
import { GetDesignationChart } from '../charts/Trees/Tree';
import { AppImages } from '@/assets';
import { GetCustomersImage } from '@/utils/Customer';


    type TreeNode = {
        user_id?: number;
        full_name?: string;
        designation_name?: string | null;
        department_name: string;
        department_color: string;
        children: TreeNode[];
    };
    
    const DesignationChart = () => {
    const svgRef = useRef();
    const containerRef = useRef();
    /*  const [treeData, setTreeData] = useState(null); */
    const [treeData, setTreeData] = useState<TreeNode | null>(null);
    const [treevalue, setTreevalue] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [data, setData] = useState(null);
    const [dimensions, setDimensions] = useState({width: 1000, height: 800});
    const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
        const name = localStorage.getItem('company_name');
        if (name) {
            console.log('companyname', name);
            setCompanyName(name);
            await fetchDepartments(name); 
        }
    };
    initialize();
}, []);
    const getInitials = (name: string) => {
        if (!name) return '';
        const words = name.trim().split(' ');
        const first = words[0]?.[0]?.toUpperCase() || '';
        const last = words.length > 1 ? words[words.length - 1][0]?.toUpperCase() : '';
        return first + last;
      };
      
    const getCustName = async () => {
        try {
            const res = localStorage.getItem('company_name');
            console.log('companyname',res)
            setCompanyName(res);
        } catch (err) {
            console.error('Problem finding customer name:', err);
        }
    };
    
    // Sample initial data (You can replace this with an API call)
    //   const initialData = {
    //     department_name: 'Company',
    //     department_color: '#0B6623', // Dark Green
    //     children: [
    //       {
    //         department_name: 'HR',
    //         department_color: '#FF5733', // Orange
    //         children: [
    //           {department_name: 'Recruitment', department_color: '#FFC300'},
    //           {department_name: 'Payroll', department_color: '#FF5733'},
    //         ],
    //       },
    //       {
    //         department_name: 'IT',
    //         department_color: '#1E90FF', // Blue
    //         children: [
    //           {department_name: 'Development', department_color: '#00BFFF'},
    //           {department_name: 'Support', department_color: '#6495ED'},
    //         ],
    //       },
    //     ],
    //     collapsed: false,
    //   };

    //   useEffect(() => {
    //     setTreeData(initialData);
    //   }, []);

    const updateTreeSize = () => {
        if (containerRef.current) {
        const {clientWidth, clientHeight} = containerRef.current;
        setDimensions({width: clientWidth, height: clientHeight});
        }
    };

    /*  const getCustName = async () => {
        try {
        const res = localStorage.getItem('company_name');
        setCompanyName(res || 'Company');
        } catch (err) {
        console.error('Problem finding customer name:', err);
        }
    }; */

    const fetchDepartments = async (companyNameFromStorage:any) => {
        try {
            setIsLoading(true);
            const response = await GetDesignationChart('');
            const result = JSON.parse(response);

            if (!result?.data || result.data.length === 0) {
                console.warn('No organization chart data found.');
                setIsLoading(false);
                return;
            }

            // Step 1: Build the tree structure with default images (fast rendering)
            const transformData = (node) => ({
                user_id: node.user_id,
                full_name: node.full_name || "No Name",
                designation_name: node.designation_name || "No Designation",
                department_name: node.department_name || "No Department",
                department_color: node.department_color || "#d3d3d3",
                image_url: AppImages.UserIcon,
                file_name: node.file_name || null,
                children: node.children ? node.children.map(transformData) : []
            });
            

            const multipleRoots = result.data.map(transformData);
            const rootNode = {
                user_id: 0,
                full_name: companyNameFromStorage || 'Org Chart',
                designation_name: "",
                department_name: "",
                department_color: "#333333",
                image_url: AppImages.UserIcon,
                children: multipleRoots
            };
            
            setTreeData(rootNode); 

            // Step 2: Fetch images separately without blocking the tree rendering
            const updateImages = async (node) => {
                if (node.file_name) {
                    const startTime = performance.now(); // Measure time
                    try {
                        const imageUrl = await GetCustomersImage(node.file_name);
                        node.image_url = imageUrl;
                        const endTime = performance.now();
                        console.log(`Image for user ${node.user_id} loaded in ${(endTime - startTime).toFixed(2)}ms`);
                        
                        // ✅ Only update the specific node in the tree
                        setTreeData(prevTree => ({ ...prevTree })); 
                    } catch (err) {
                        console.error(`Error fetching image for user ${node.user_id}:`, err);
                    }
                }

                // Recursively fetch images for children
                if (node.children && node.children.length > 0) {
                    await Promise.all(node.children.map(updateImages));
                }
            };

            // Step 3: Start image fetching in the background (not blocking the UI)
            setTimeout(() => {
                updateImages(rootNode).then(() => {
                    console.log("✅ All images loaded asynchronously.");
                });
            }, 100); // Delay slightly to ensure UI update

        } catch (error) {
            console.error('Error fetching organization chart:', error);
        } finally {
            setIsLoading(false);
        }
    };



    /* const fetchDepartments = async () => {
        try {
            setIsLoading(true);
            const response = await GetDesignationChart('');
            const result = JSON.parse(response);

            if (!result?.data || result.data.length === 0) {
                console.warn('No organization chart data found.');
                setIsLoading(false);
                return;
            }

            const transformData = (node) => ({
                user_id: node.user_id,
                full_name: node.full_name || "No Name",
                designation_name: node.designation_name || "No Designation",
                department_name: node.department_name || "No Department",
                department_color: node.department_color || "#d3d3d3",
                image_url: AppImages.dummyprofile, // Set default image
                children: node.children ? node.children.map(transformData) : []
            });

            const rootNode = transformData(result.data[0]);
            setTreeData(rootNode);

            // Fetch images after tree is rendered
            fetchImagesForNodes(rootNode);
        } catch (error) {
            console.error('Error fetching organization chart:', error);
        }
        finally {
            setIsLoading(false);
        }
    };


    const fetchImagesForNodes = async (node) => {
        if (node.user_id && node.file_name) {
            try {
                const imageUrl = await GetCustomersImage(node.file_name);
                node.image_url = imageUrl;
            } catch (err) {
                console.error(`Error fetching image for user ${node.user_id}:`, err);
            }
        }

        if (node.children) {
            await Promise.all(node.children.map(fetchImagesForNodes));
        }

        setTreeData((prevData) => ({ ...prevData })); 
    };


    */

    /* const fetchDepartments = () => {
        const staticData = {
        designation_name: "CEO",
        full_name: "Jon Doe",
        department_color: "black",
        children: [
            {
            designation_name: "CTO",
            full_name: "Alice Johnson",
            department_color: "#1E90FF", // Blue
            children: [
                {
                designation_name: "Senior Developer",
                full_name: "Bob Williams",
                department_color: "#00BFFF", // Light Blue
                children: [
                    {
                    designation_name: "Junior Developer",
                    full_name: "Charlie Smith",
                    department_color: "#87CEFA",
                    children: []
                    },
                    {
                    designation_name: "Intern",
                    full_name: "David Brown",
                    department_color: "#B0C4DE",
                    children: []
                    }
                ]
                },
                {
                designation_name: "DevOps Engineer",
                full_name: "Eva Green",
                department_color: "#228B22", // Green
                children: []
                }
            ]
            },
            {
            designation_name: "CFO",
            full_name: "Michael Roberts",
            department_color: "#FFD700", // Gold
            children: [
                {
                designation_name: "Finance Manager",
                full_name: "Sophia Davis",
                department_color: "#FFA500", // Orange
                children: [
                    {
                    designation_name: "Accountant",
                    full_name: "Ryan Clark",
                    department_color: "#FF8C00",
                    children: []
                    }
                ]
                }
            ]
            },
            {
            designation_name: "COO",
            full_name: "Emma Wilson",
            department_color: "#DC143C", // Red
            children: [
                {
                designation_name: "Operations Manager",
                full_name: "James Lee",
                department_color: "#FF4500",
                children: [
                    {
                    designation_name: "Logistics Coordinator",
                    full_name: "Emily White",
                    department_color: "#FF6347",
                    children: []
                    },
                    {
                    designation_name: "Warehouse Supervisor",
                    full_name: "Lucas Martinez",
                    department_color: "#CD5C5C",
                    children: []
                    }
                ]
                }
            ]
            }
        ]
        };
    
        setTreeData(staticData);
    }; */
    
    

    const getFontSize = (text, maxLength) => {
        return text.length > maxLength ? '6' : '10'; // Reduce font size for long text
    };
    /*   useEffect(() => {
        const initializeData = async () => {
        await getCustName();
        };
        initializeData();
    }, []); */

    /*   useEffect(() => {
        if (companyName) {
        fetchDepartments();
        }
    }, [companyName]); */
   

    /*  useEffect(() => {
        if (shouldFetch) {
        fetchDepartments();
        setShouldFetch(false);
        }
    }, [shouldFetch]); */

    useEffect(() => {
        if (treeData) {
        updateTreeSize();
        drawTree();
        }
    }, [treeData]);

    // ** Toggle collapse function **
    const toggleNode = node => {
        node.collapsed = !node.collapsed;
        if (node.collapsed) {
        node._children = node.children; // Store children
        node.children = null; // Hide them
        } else {
        node.children = node._children; // Restore children
        node._children = null;
        }
        //setTreeData({...treeData}); // Force React update
        drawTree();
    };

    // **Function to Determine Font Color Based on Background**
    const getFontColor = bgColor => {
        if (!bgColor) return '#000'; // Default black if no color is provided
        // console.log(bgColor.toLowerCase());
        if (bgColor.toLowerCase() === 'lightgray') {
        return '#000000'; // Force black text for light grey
        }
        const hex = bgColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#FFFFFF'; // Use black text for light backgrounds, white for dark
    };

    const wrapText = (text, maxLength = 16) => {
        if (!text) return ""; 
        const words = text.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [];
        return words.join("\n");
    };

    const drawTree = () => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear previous SVG elements
    
        const {width, height} = dimensions;
        const margin = {top: 50, left: width / 2 + 50};

        const boxWidth = 200;
  const boxHeight = 100;
  const imageSize = 70;
  const textXOffset = imageSize / 2 + 45;
  const yOffset = 30;
    
        const root = d3.hierarchy(treeData, d => d.children || []);
    
        const nodeSpacingX = Math.max(180, width / (root.height + 2));
        const nodeSpacingY = Math.max(220, height / (root.height + 2));
    
        const treeLayout = d3.tree().nodeSize([nodeSpacingY, nodeSpacingX]);
        treeLayout(root);
    
        const zoomGroup = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
        const defaultZoomLevel = 0.6;
        const defaultTransform = d3.zoomIdentity.translate(width / 2, 100).scale(defaultZoomLevel);
    
        const zoom = d3.zoom()
        .scaleExtent([0.1, 2])
        .on('zoom', event => {
            zoomGroup.attr('transform', event.transform);
        });
    
        svg.call(zoom).call(zoom.transform, defaultTransform);
    
    /*  zoomGroup
        .selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr(
            'd',
            d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        )
        .style('fill', 'none')
        .style('stroke', '#999')
        .style('stroke-width', 1.5); */     

       // Group children by parent to avoid redrawing shared segments
const linksByParent = d3.group(root.links(), d => d.source);

linksByParent.forEach((links, parentNode) => {
  const parentX = parentNode.x;
  const parentY = parentNode.y + boxHeight / 2 + yOffset;

  const childXs = links.map(d => d.target.x);
  const childYs = links.map(d => d.target.y - boxHeight / 2 + yOffset);

  const minX = d3.min(childXs);
  const maxX = d3.max(childXs);
  const midY = (parentY + d3.min(childYs)) / 2;

  // 1. Vertical line from parent to midY (draw only once per parent)
  zoomGroup.append('path')
    .attr('d', `M${parentX},${parentY} L${parentX},${midY}`)
    .attr('class', 'link')
    .style('stroke', 'black')
    .style('stroke-width', 1.5)
    .style('fill', 'none');

  // 2. Single horizontal line across all children
  zoomGroup.append('path')
    .attr('d', `M${minX},${midY} L${maxX},${midY}`)
    .attr('class', 'link')
    .style('stroke', 'black')
    .style('stroke-width', 1.5)
    .style('fill', 'none');

  // 3. Vertical lines from midY down to each child
  links.forEach(link => {
    const childX = link.target.x;
    const childY = link.target.y - boxHeight / 2 + yOffset;

    zoomGroup.append('path')
      .attr('d', `M${childX},${midY} L${childX},${childY}`)
      .attr('class', 'link')
      .style('stroke', 'black')
      .style('stroke-width', 1.5)
      .style('fill', 'none');
  });
});


    
        const nodes = zoomGroup
        .selectAll('.node')
        .data(root.descendants(), d => d.data.designation_name)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y+30})`)
        .on('click', (event, d) => {
            toggleNode(d.data);
        });
    
       /*  const boxWidth = 200;
        const boxHeight = 100;
        const imageSize = 70; 
        const textXOffset = imageSize / 2 + 45;  */
    
    
        nodes
        .append('rect')
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('x', -boxWidth / 2)
        .attr('y', -boxHeight / 2)
        .attr('rx', 8)
        .style('fill', d => d.data.department_color || 'lightblue')
        .style('stroke', 'black')
        .style('cursor', 'pointer');
    
    
        nodes.each(function (d) {
            const group = d3.select(this);
            const hasImage = d.data.image_url && d.data.file_name;
          
            if (hasImage) {
              group.append('image')
                .attr('x', -boxWidth / 2 + 5)
                .attr('y', -imageSize / 2)
                .attr('width', imageSize)
                .attr('height', imageSize)
                .attr('href', d.data.image_url)
                .attr('clip-path', 'circle()');
            } else {
              const fontColor = getFontColor(d.data.department_color);
            /*   const bgColor = fontColor === '#FFFFFF' ? '#000000' : '#FFFFFF';
              const textColor = fontColor; // Use fontColor as text color */
              const bgColor = '#FFFFFF'; 
              const textColor = 'black'; 
              const initialsFontSize = '25px';
              // Circle for initials
              group.append('circle')
                .attr('cx', -boxWidth / 2 + 5 + imageSize / 2)
                .attr('cy', 0)
                .attr('r', imageSize / 2)
                .style('fill', bgColor)
                .style('stroke', 'black');
          
              // Text (initials)
             /*  group.append('text')
                .attr('x', -boxWidth / 2 + 5 + imageSize / 2)
                .attr('y', 5)
                .attr('text-anchor', 'middle')
                .attr('y', '0.35em')
                .style('font-size', initialsFontSize)
                .style('fill', d => d.data.department_color || 'lightblue')
                .style('font-weight', 'bold')
                .text(getInitials(d.data.full_name)); */
                group.append('text')
  .attr('x', -boxWidth / 2 + 5 + imageSize / 2)
  .attr('text-anchor', 'middle')
  .attr('dominant-baseline', 'middle')
  .style('font-size', initialsFontSize)
  .style('fill', d => d.data.department_color || 'lightblue') 
  .style('stroke', 'black')
  .style('stroke-width', 0.5)
  .style('paint-order', 'stroke') 
  .style('stroke-linejoin', 'round')
  .style('font-weight', 'bold')
  .text(getInitials(d.data.full_name));
            }
          });
          
    
    
          nodes
          .filter(d => d.depth === 0) 
          .append('text')
          .attr('text-anchor', 'start') 
          .attr('dominant-baseline', 'middle')
          .style('font-size', '18px')
          .style('font-weight', 'bold')
          .style('fill', d => getFontColor(d.data.department_color))
          .each(function (d) {
            const textNode = d3.select(this);
            const lines = wrapText(d.data.full_name, 16).split("\n");
            const totalLines = lines.length;
            const lineHeight = 20; 
        
          
            const startY = -((totalLines - 1) / 2) * lineHeight;
        
            lines.forEach((line, i) => {
              textNode.append('tspan')
                .attr('x',-8)
                .attr('y', startY + i * lineHeight)
                .text(line);
            });
          });
        
        
        nodes
        .filter(d => d.depth !== 0)
        .append('text')
        .attr('x', -boxWidth / 2 + textXOffset) 
        .attr('y', -15) 
        .attr('text-anchor', 'start')
        .style('font-size', '14px') 
        .style('font-weight', 'bold')
        .style('fill', d => getFontColor(d.data.department_color))
        .each(function(d) {  
            const textNode = d3.select(this);
            const lines = wrapText(d.data.full_name, 16).split("\n");
            lines.forEach((line, i) => {
                textNode.append('tspan')
                    .attr('x', -boxWidth / 2 + textXOffset)
                    .attr('dy', i === 0 ? 0 : 15)  
                    .text(line);
            });
        });

    nodes
        .append('text')
        .attr('x', -boxWidth / 2 + textXOffset) 
        .attr('y', 13)
        .attr('text-anchor', 'start')
        .style('font-size', '12px') 
        .style('fill', d => getFontColor(d.data.department_color))
        .each(function(d) {  
            const textNode = d3.select(this);
            const lines = wrapText(d.data.designation_name, 20).split("\n");
            lines.forEach((line, i) => {
                textNode.append('tspan')
                    .attr('x', -boxWidth / 2 + textXOffset)
                    .attr('dy', i === 0 ? 0 : 15)  
                    .text(line);
            });
        });
        nodes
        .append('text')
        .attr('x', -boxWidth / 2 + textXOffset) 
        .attr('y', 35)
        .attr('x', -boxWidth / 2 + textXOffset)
        .style('font-size', '12px') 
        .style('fill', d => getFontColor(d.data.department_color))
        .each(function(d) {  
            const textNode = d3.select(this);
            const lines = wrapText(d.data.department_name, 16).split("\n");
            lines.forEach((line, i) => {
                textNode.append('tspan')
                    .attr('x', -boxWidth / 2 + textXOffset)
                    .attr('dy', i === 0 ? 0 : 15)  
                    .text(line);
            });
        });

    
    };
    

    return (
        // <div>
        //   <h4>Organization Chart</h4>
        //   <svg ref={svgRef} width={800} height={500} />
        // </div>

        <div className="tree-container" ref={containerRef}>
        {/* <h4>Organization Chart</h4> */}
        {/* <div className="scrollable"> */}
        <div>
        {isLoading ? (
                <span size="large" color="#007AFF"  style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -25 }, { translateY: -25 }]
        }} />
            ) : (
            <svg
            ref={svgRef}
            width={dimensions.width + 500}
            height={dimensions.height}
            />
        )}
        </div>
        </div>
    );
    };

    export default DesignationChart;
