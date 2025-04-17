0-meta.tex
==========

.. code-block:: latex

   \newcommand{\midgardtitle}{Midgard L2: Scaling Cardano with Optimistic Rollups}
   \newcommand{\midgardcovertitle}{Midgard L2: Scaling Cardano \\ with Optimistic Rollups\par}

   % \newcommand{\midgardversion}{1.0}

   \newcommand{\anastasiaLabsEmail}{\href{mailto:info@anastasialabs.com}{info@anastasialabs.com}}

   \newcommand{\midgardauthors}[4]{
       \begin{contributors}{#1}{#2}{#3}{#4}
           \contributor{Philip DiSarro}{Anastasia Labs}
           \contributor[\anastasiaLabsEmail]{Jonathan Rodriguez}{Anastasia Labs}
           \contributor{George Flerovsky}{}
       \end{contributors}
   }

   \newcommand{\midgardcontributors}[4]{
       \begin{contributors}{#1}{#2}{#3}{#4}
           \contributor{Raul Antonio}{Fluid Tokens}
           \contributor{Matteo Coppola}{Fluid Tokens}
           \contributor{fallen-icarus}{P2P-Defi}
           \contributor{Riley Kilgore}{IOG}
           \contributor{Keyan Maskoot}{Anastasia Labs}
           \contributor{Bora Oben}{Anastasia Labs}
           \contributor{Mark Petruska}{Anastasia Labs}
           \contributor{Kasey White}{Cardano Foundation}
       \end{contributors}
   }

   \hypersetup{
     pdftitle={\midgardtitle~(DRAFT~\today)},
     pdfauthor={Philip DiSarro, Jonathan Rodriguez, George Flerovsky},
     pdfpublisher={Anastasia Labs},
     pdfcontactemail={\anastasiaLabsEmail}
     pdfsubject={Cardano blockchain Layer 2 scaling},
     pdfkeywords={Cardano blockchain L2 scaling Midgard optimistic rollup},
   }

   \ifthenelse{\isundefined{\midgardversion}}{}{\hypersetup{
     pdftitle={\midgardtitle~(v\midgardversion)},
     pdfversionid = {\midgardversion}
   }}